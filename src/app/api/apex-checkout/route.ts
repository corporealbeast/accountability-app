import { NextResponse } from "next/server";

const BASE  = "https://services.leadconnectorhq.com";
const TOKEN = process.env.GHL_ACCESS_TOKEN;
const LOC   = process.env.GHL_LOCATION_ID;

function ghlHeaders() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
    Version: "2021-07-28",
  };
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request) {
  if (!TOKEN || !LOC) {
    return NextResponse.json(
      { error: "GHL credentials not configured" },
      { status: 500, headers: corsHeaders() }
    );
  }

  let body: {
    name: string;
    email: string;
    phone?: string;
    cart: { sku: string; name: string; price: number; qty: number; desc?: string }[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: corsHeaders() }
    );
  }

  const { name, email, phone, cart } = body;

  if (!name || !email || !cart?.length) {
    return NextResponse.json(
      { error: "name, email, and cart are required" },
      { status: 400, headers: corsHeaders() }
    );
  }

  // ── 1. Find or create GHL contact ────────────────────────────────────────────
  let contactId: string;

  const searchRes = await fetch(
    `${BASE}/contacts/?locationId=${LOC}&query=${encodeURIComponent(email)}&limit=1`,
    { headers: ghlHeaders() }
  );
  const searchData = await searchRes.json();
  const existing = searchData.contacts?.[0];

  if (existing) {
    contactId = existing.id;
  } else {
    const createRes = await fetch(`${BASE}/contacts/`, {
      method: "POST",
      headers: ghlHeaders(),
      body: JSON.stringify({
        locationId: LOC,
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" ") || "",
        email,
        phone: phone ?? "",
        tags: ["apex-peptides-customer"],
        source: "Apex Peptides Website",
      }),
    });
    const createData = await createRes.json();
    if (!createRes.ok) {
      return NextResponse.json(
        { error: "Failed to create contact", detail: createData },
        { status: 502, headers: corsHeaders() }
      );
    }
    contactId = createData.contact?.id ?? createData.id;
  }

  // ── 2. Build invoice line items ───────────────────────────────────────────────
  const items = cart.map((item) => ({
    name: item.name,
    description: item.desc ?? item.sku,
    currency: "USD",
    amount: item.price,
    qty: item.qty,
    type: "one_time",
  }));

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  // ── 3. Create GHL invoice ─────────────────────────────────────────────────────
  const invoiceRes = await fetch(`${BASE}/invoices/`, {
    method: "POST",
    headers: ghlHeaders(),
    body: JSON.stringify({
      altId: LOC,
      altType: "location",
      name: `Apex Peptides Order — ${name}`,
      currency: "USD",
      contactDetails: {
        id: contactId,
        name,
        email,
        phoneNo: phone ?? "",
      },
      items,
      title: "Apex Peptides",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      terms: "Research use only. All sales final.",
      businessDetails: {
        name: "Apex Peptides",
        email: "support@apexpeptides.com",
        website: "https://apex-interface.vibepreview.com",
        address: "",
        city: "",
        state: "",
        country: "US",
        postalCode: "",
      },
    }),
  });

  const invoiceData = await invoiceRes.json();

  if (!invoiceRes.ok) {
    return NextResponse.json(
      { error: "Failed to create invoice", detail: invoiceData },
      { status: 502, headers: corsHeaders() }
    );
  }

  const invoiceId = invoiceData.invoice?._id ?? invoiceData.invoice?.id ?? invoiceData._id ?? invoiceData.id;
  const paymentUrl =
    invoiceData.invoice?.shareLink ??
    invoiceData.shareLink ??
    `https://app.gohighlevel.com/invoices/${invoiceId}`;

  // ── 4. Send invoice to contact via email ──────────────────────────────────────
  if (invoiceId) {
    await fetch(`${BASE}/invoices/${invoiceId}/send`, {
      method: "POST",
      headers: ghlHeaders(),
      body: JSON.stringify({
        altId: LOC,
        altType: "location",
        action: "send_to_contact",
      }),
    });
  }

  return NextResponse.json(
    { success: true, invoiceId, paymentUrl, total },
    { status: 200, headers: corsHeaders() }
  );
}
