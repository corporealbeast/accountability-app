import { NextResponse } from "next/server";

const BASE  = "https://services.leadconnectorhq.com";
const TOKEN = process.env.GHL_ACCESS_TOKEN;
const LOC   = process.env.GHL_LOCATION_ID;

function headers() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    Version: "2021-04-15",
    "Content-Type": "application/json",
  };
}

export async function GET() {
  if (!TOKEN || !LOC) {
    return NextResponse.json(
      { error: "GHL credentials not configured. Add GHL_ACCESS_TOKEN and GHL_LOCATION_ID to .env.local" },
      { status: 500 }
    );
  }

  const now           = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  try {
    const [contactsRes, appointmentsRes, opportunitiesRes] = await Promise.allSettled([
      fetch(`${BASE}/contacts/?locationId=${LOC}&limit=20&sortBy=dateAdded&sortOrder=desc`, { headers: headers() }),
      fetch(`${BASE}/calendars/appointments?locationId=${LOC}&startTime=${thirtyDaysAgo.toISOString()}&endTime=${now.toISOString()}&limit=20`, { headers: headers() }),
      fetch(`${BASE}/opportunities/search?location_id=${LOC}&limit=20`, { headers: headers() }),
    ]);

    const contacts      = contactsRes.status     === "fulfilled" ? await contactsRes.value.json()     : { contacts: [] };
    const appointments  = appointmentsRes.status === "fulfilled" ? await appointmentsRes.value.json() : { appointments: [] };
    const opportunities = opportunitiesRes.status === "fulfilled" ? await opportunitiesRes.value.json(): { opportunities: [] };

    return NextResponse.json({ contacts, appointments, opportunities });
  } catch {
    return NextResponse.json({ error: "Failed to fetch GHL data" }, { status: 500 });
  }
}

// ── Write actions ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  if (!TOKEN || !LOC) {
    return NextResponse.json({ error: "GHL credentials not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { action, ...data } = body as { action: string; [key: string]: unknown };

  try {
    switch (action) {

      case "create_contact": {
        const res = await fetch(`${BASE}/contacts/`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ locationId: LOC, ...data }),
        });
        const result = await res.json();
        if (!res.ok) return NextResponse.json({ error: result }, { status: res.status });
        return NextResponse.json({ success: true, contact: result.contact ?? result });
      }

      case "update_contact": {
        const { contactId, ...fields } = data as { contactId: string; [key: string]: unknown };
        const res = await fetch(`${BASE}/contacts/${contactId}`, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify(fields),
        });
        const result = await res.json();
        if (!res.ok) return NextResponse.json({ error: result }, { status: res.status });
        return NextResponse.json({ success: true, contact: result.contact ?? result });
      }

      case "add_tags": {
        const { contactId, tags } = data as { contactId: string; tags: string[] };
        const res = await fetch(`${BASE}/contacts/${contactId}/tags`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ tags }),
        });
        const result = await res.json();
        if (!res.ok) return NextResponse.json({ error: result }, { status: res.status });
        return NextResponse.json({ success: true, tags: result });
      }

      case "remove_tags": {
        const { contactId, tags } = data as { contactId: string; tags: string[] };
        const res = await fetch(`${BASE}/contacts/${contactId}/tags`, {
          method: "DELETE",
          headers: headers(),
          body: JSON.stringify({ tags }),
        });
        const result = await res.json();
        if (!res.ok) return NextResponse.json({ error: result }, { status: res.status });
        return NextResponse.json({ success: true, tags: result });
      }

      case "send_message": {
        const { contactId, type, message } = data as { contactId: string; type: string; message: string };

        // Find or create a conversation for this contact
        const convSearchRes = await fetch(
          `${BASE}/conversations/search?locationId=${LOC}&contactId=${contactId}`,
          { headers: headers() }
        );
        const convData = await convSearchRes.json();
        let conversationId: string | null = convData.conversations?.[0]?.id ?? null;

        if (!conversationId) {
          const newConvRes = await fetch(`${BASE}/conversations/`, {
            method: "POST",
            headers: headers(),
            body: JSON.stringify({ locationId: LOC, contactId }),
          });
          const newConv = await newConvRes.json();
          conversationId = newConv.conversation?.id ?? newConv.id ?? null;
        }

        if (!conversationId) {
          return NextResponse.json({ error: "Could not find or create conversation for this contact" }, { status: 500 });
        }

        const msgRes = await fetch(`${BASE}/conversations/messages`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ type, conversationId, message }),
        });
        const msgResult = await msgRes.json();
        if (!msgRes.ok) return NextResponse.json({ error: msgResult }, { status: msgRes.status });
        return NextResponse.json({ success: true, message: msgResult });
      }

      case "create_note": {
        const { contactId, body: noteBody } = data as { contactId: string; body: string };
        const res = await fetch(`${BASE}/contacts/${contactId}/notes`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ body: noteBody, userId: "" }),
        });
        const result = await res.json();
        if (!res.ok) return NextResponse.json({ error: result }, { status: res.status });
        return NextResponse.json({ success: true, note: result.note ?? result });
      }

      case "create_opportunity": {
        const res = await fetch(`${BASE}/opportunities/`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ locationId: LOC, ...data }),
        });
        const result = await res.json();
        if (!res.ok) return NextResponse.json({ error: result }, { status: res.status });
        return NextResponse.json({ success: true, opportunity: result.opportunity ?? result });
      }

      case "update_opportunity": {
        const { opportunityId, ...fields } = data as { opportunityId: string; [key: string]: unknown };
        const res = await fetch(`${BASE}/opportunities/${opportunityId}`, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify(fields),
        });
        const result = await res.json();
        if (!res.ok) return NextResponse.json({ error: result }, { status: res.status });
        return NextResponse.json({ success: true, opportunity: result.opportunity ?? result });
      }

      case "get_contacts": {
        const { limit = 20, query } = data as { limit?: number; query?: string };
        const url = query
          ? `${BASE}/contacts/?locationId=${LOC}&limit=${limit}&query=${encodeURIComponent(query)}`
          : `${BASE}/contacts/?locationId=${LOC}&limit=${limit}&sortBy=dateAdded&sortOrder=desc`;
        const res = await fetch(url, { headers: headers() });
        const result = await res.json();
        return NextResponse.json({ success: true, contacts: result.contacts ?? [] });
      }

      case "get_opportunities": {
        const { limit = 20 } = data as { limit?: number };
        const res = await fetch(`${BASE}/opportunities/search?location_id=${LOC}&limit=${limit}`, { headers: headers() });
        const result = await res.json();
        return NextResponse.json({ success: true, opportunities: result.opportunities ?? [] });
      }

      case "get_appointments": {
        const { limit = 20 } = data as { limit?: number };
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const res = await fetch(
          `${BASE}/calendars/appointments?locationId=${LOC}&startTime=${thirtyDaysAgo.toISOString()}&endTime=${now.toISOString()}&limit=${limit}`,
          { headers: headers() }
        );
        const result = await res.json();
        return NextResponse.json({ success: true, appointments: result.appointments ?? [] });
      }

      // ── Funnel Actions ─────────────────────────────────────────────────────

      case "list_funnels": {
        const res = await fetch(`${BASE}/funnels?locationId=${LOC}`, { headers: headers() });
        const result = await res.json();
        if (!res.ok) return NextResponse.json({ error: result }, { status: res.status });
        return NextResponse.json({ success: true, funnels: result.funnels ?? [] });
      }

      case "get_funnel": {
        const { funnelId } = data as { funnelId: string };
        const res = await fetch(`${BASE}/funnels/${funnelId}`, { headers: headers() });
        const result = await res.json();
        if (!res.ok) return NextResponse.json({ error: result }, { status: res.status });
        return NextResponse.json({ success: true, funnel: result.funnel ?? result });
      }

      case "get_funnel_pages": {
        const { funnelId } = data as { funnelId: string };
        const res = await fetch(`${BASE}/funnels/${funnelId}/pages`, { headers: headers() });
        const result = await res.json();
        if (!res.ok) return NextResponse.json({ error: result }, { status: res.status });
        return NextResponse.json({ success: true, pages: result.pages ?? [] });
      }

      case "update_funnel_page": {
        const { funnelId, pageId, ...fields } = data as { funnelId: string; pageId: string; [key: string]: unknown };
        const res = await fetch(`${BASE}/funnels/${funnelId}/pages/${pageId}`, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify(fields),
        });
        const result = await res.json();
        if (!res.ok) return NextResponse.json({ error: result }, { status: res.status });
        return NextResponse.json({ success: true, page: result.page ?? result });
      }

      case "get_funnel_steps": {
        const { funnelId } = data as { funnelId: string };
        const res = await fetch(`${BASE}/funnels/${funnelId}/steps`, { headers: headers() });
        const result = await res.json();
        if (!res.ok) return NextResponse.json({ error: result }, { status: res.status });
        return NextResponse.json({ success: true, steps: result.steps ?? [] });
      }

      case "update_funnel_step": {
        const { funnelId, stepId, ...fields } = data as { funnelId: string; stepId: string; [key: string]: unknown };
        const res = await fetch(`${BASE}/funnels/${funnelId}/steps/${stepId}`, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify(fields),
        });
        const result = await res.json();
        if (!res.ok) return NextResponse.json({ error: result }, { status: res.status });
        return NextResponse.json({ success: true, step: result.step ?? result });
      }

      case "create_funnel_page": {
        const { funnelId, ...fields } = data as { funnelId: string; [key: string]: unknown };
        const res = await fetch(`${BASE}/funnels/${funnelId}/pages`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(fields),
        });
        const result = await res.json();
        if (!res.ok) return NextResponse.json({ error: result }, { status: res.status });
        return NextResponse.json({ success: true, page: result.page ?? result });
      }

      case "delete_funnel_page": {
        const { funnelId, pageId } = data as { funnelId: string; pageId: string };
        const res = await fetch(`${BASE}/funnels/${funnelId}/pages/${pageId}`, {
          method: "DELETE",
          headers: headers(),
        });
        const result = await res.json();
        if (!res.ok) return NextResponse.json({ error: result }, { status: res.status });
        return NextResponse.json({ success: true, deleted: true });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: `GHL operation failed: ${err}` }, { status: 500 });
  }
}
