import "server-only";
import {
  GoogleGenerativeAI,
  SchemaType,
  type FunctionDeclaration,
  type Content,
} from "@google/generative-ai";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { validateDeliveryZone } from "@/lib/services/geo";
import { BRAND } from "@/lib/constants";

const SYSTEM_INSTRUCTION = `You are AG Assistant, the official AI shopping assistant for ${BRAND.appName} by ${BRAND.parentCompany}.

Business: ${BRAND.parentCompany}
Product: ${BRAND.appName}
Location: ${BRAND.serviceLocationLabel}
Delivery radius: a fixed number of KM around that location (call check_delivery_zone to get the exact figure and verdict — never state a number from memory)

Hard rules, no exceptions:
- NEVER invent a product, price, or discount. Always call get_products for current packs and prices.
- NEVER invent an order status. Always call get_order_status for a real status; if no phone/order is available, ask the customer for their order number or phone instead of guessing.
- NEVER claim delivery is available outside the 3 KM zone. Always call check_delivery_zone when asked about delivery to a specific place, and never override its verdict.
- NEVER invent a discount, coupon, or promotion that get_products/settings didn't return.
- If you cannot resolve something, say so plainly and suggest contacting AG Enterprises on WhatsApp — do not guess.
- To add or remove items from the customer's cart, call add_to_cart_action / remove_from_cart_action — these are UI actions the app applies on the customer's device, not a purchase.
- Keep replies short, warm, and specific to eggs/AG Fresh Eggs. This is not a general-purpose assistant.`;

const tools: FunctionDeclaration[] = [
  {
    name: "get_products",
    description:
      "Returns the current live catalog of egg packs with pack label, pieces, price, and stock status. Always call this before quoting any price or pack.",
    parameters: { type: SchemaType.OBJECT, properties: {} },
  },
  {
    name: "check_delivery_zone",
    description:
      "Checks whether a given latitude/longitude falls inside AG Fresh Eggs' delivery zone around Danapur.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        latitude: { type: SchemaType.NUMBER },
        longitude: { type: SchemaType.NUMBER },
      },
      required: ["latitude", "longitude"],
    },
  },
  {
    name: "get_order_status",
    description:
      "Looks up the most recent order and its status for a customer's 10-digit phone number.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: { phone: { type: SchemaType.STRING } },
      required: ["phone"],
    },
  },
  {
    name: "add_to_cart_action",
    description:
      "Requests that the app add a pack to the customer's cart. This does not place an order.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        packLabel: { type: SchemaType.STRING, description: "Exact pack_label from get_products" },
        quantity: { type: SchemaType.NUMBER },
      },
      required: ["packLabel", "quantity"],
    },
  },
  {
    name: "remove_from_cart_action",
    description: "Requests that the app remove a pack from the customer's cart.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        packLabel: { type: SchemaType.STRING, description: "Exact pack_label from get_products" },
      },
      required: ["packLabel"],
    },
  },
];

export type CartAction =
  | { type: "add"; packLabel: string; quantity: number }
  | { type: "remove"; packLabel: string };

async function executeTool(
  name: string,
  args: Record<string, unknown>,
): Promise<{ result: unknown; cartAction?: CartAction }> {
  const supabase = createAdminSupabaseClient();

  switch (name) {
    case "get_products": {
      const { data } = await supabase
        .from("products")
        .select("pack_label, pieces, price, in_stock, stock_qty")
        .order("sort_order");
      return { result: { products: data ?? [] } };
    }

    case "check_delivery_zone": {
      const { latitude, longitude } = args as { latitude: number; longitude: number };
      return { result: validateDeliveryZone({ latitude, longitude }) };
    }

    case "get_order_status": {
      const { phone } = args as { phone: string };
      const { data } = await supabase
        .from("orders")
        .select("order_number, status, payment_status, total, created_at")
        .eq("customer_phone", phone)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return { result: data ?? { message: "No orders found for this number." } };
    }

    case "add_to_cart_action": {
      const { packLabel, quantity } = args as { packLabel: string; quantity: number };
      return {
        result: { queued: true },
        cartAction: { type: "add", packLabel, quantity },
      };
    }

    case "remove_from_cart_action": {
      const { packLabel } = args as { packLabel: string };
      return {
        result: { queued: true },
        cartAction: { type: "remove", packLabel },
      };
    }

    default:
      return { result: { error: `Unknown tool: ${name}` } };
  }
}

export async function runAgAssistant(params: {
  message: string;
  history: Content[];
}): Promise<{ reply: string; cartActions: CartAction[] }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Set it in .env.local.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
    tools: [{ functionDeclarations: tools }],
  });

  const chat = model.startChat({ history: params.history });
  let response = (await chat.sendMessage(params.message)).response;

  const cartActions: CartAction[] = [];
  let guard = 0;

  // Tool-calling loop: keep executing whatever the model asks for until it returns
  // plain text. Capped so a misbehaving model can't loop forever.
  while (guard < 5) {
    const calls = response.functionCalls();
    if (!calls || calls.length === 0) break;

    const parts = [];
    for (const call of calls) {
      const { result, cartAction } = await executeTool(call.name, call.args as Record<string, unknown>);
      if (cartAction) cartActions.push(cartAction);
      parts.push({ functionResponse: { name: call.name, response: { result } } });
    }

    response = (await chat.sendMessage(parts)).response;
    guard += 1;
  }

  return { reply: response.text(), cartActions };
}
