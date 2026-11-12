import { NextRequest, NextResponse } from "next/server";

const allowedTypes = new Set(["application/pdf", "image/png", "image/jpeg", "text/plain"]);
const maxBytes = 5 * 1024 * 1024;
interface StoredDocument { id: string; ownerId: string; name: string; type: string; size: number; category: string; uploadedAt: string; bytes: ArrayBuffer }
const documentStore = globalThis as typeof globalThis & { careflowDocuments?: Map<string, StoredDocument> };
if (!documentStore.careflowDocuments) documentStore.careflowDocuments = new Map();

function owner(request: NextRequest) { return request.headers.get("x-careflow-demo-user") === "jordan" ? "jordan" : null; }
function safeName(value: string) { return value.replace(/[\\/\0"\r\n]/g, "").trim().slice(0, 120); }

export async function GET(request: NextRequest) {
  const ownerId = owner(request);
  if (!ownerId) return NextResponse.json({ error: "Demo patient session required." }, { status: 401 });
  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const document = documentStore.careflowDocuments!.get(id);
    if (!document || document.ownerId !== ownerId) return NextResponse.json({ error: "Document not found." }, { status: 404 });
    return new Response(document.bytes.slice(0), { headers: { "content-type": document.type, "content-disposition": `attachment; filename="${safeName(document.name)}"`, "cache-control": "private, no-store" } });
  }
  const documents = Array.from(documentStore.careflowDocuments!.values()).filter((item) => item.ownerId === ownerId).map((item) => ({ id: item.id, ownerId: item.ownerId, name: item.name, type: item.type, size: item.size, category: item.category, uploadedAt: item.uploadedAt }));
  return NextResponse.json({ documents }, { headers: { "cache-control": "private, no-store" } });
}

export async function POST(request: NextRequest) {
  const ownerId = owner(request);
  if (!ownerId) return NextResponse.json({ error: "Demo patient session required." }, { status: 401 });
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > maxBytes + 100_000) return NextResponse.json({ error: "File is larger than 5 MB." }, { status: 413 });
  const form = await request.formData(); const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Only PDF, PNG, JPEG, and TXT files are supported." }, { status: 415 });
  if (file.size === 0 || file.size > maxBytes) return NextResponse.json({ error: "File must be between 1 byte and 5 MB." }, { status: 400 });
  const name = safeName(file.name);
  if (!name) return NextResponse.json({ error: "File name is invalid." }, { status: 400 });
  const document: StoredDocument = { id: crypto.randomUUID(), ownerId, name, type: file.type, size: file.size, category: safeName(String(form.get("category") || "Other")), uploadedAt: new Date().toISOString(), bytes: await file.arrayBuffer() };
  documentStore.careflowDocuments!.set(document.id, document);
  const metadata = { id: document.id, ownerId: document.ownerId, name: document.name, type: document.type, size: document.size, category: document.category, uploadedAt: document.uploadedAt };
  return NextResponse.json({ document: metadata }, { status: 201, headers: { "cache-control": "private, no-store" } });
}

export async function PATCH(request: NextRequest) {
  const ownerId = owner(request); if (!ownerId) return NextResponse.json({ error: "Demo patient session required." }, { status: 401 });
  const body = await request.json() as { id?: string; name?: string }; const document = body.id ? documentStore.careflowDocuments!.get(body.id) : undefined;
  if (!document || document.ownerId !== ownerId) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  const name = safeName(body.name || ""); if (!name) return NextResponse.json({ error: "Enter a valid file name." }, { status: 400 });
  document.name = name; documentStore.careflowDocuments!.set(document.id, document);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const ownerId = owner(request); if (!ownerId) return NextResponse.json({ error: "Demo patient session required." }, { status: 401 });
  const id = request.nextUrl.searchParams.get("id"); const document = id ? documentStore.careflowDocuments!.get(id) : undefined;
  if (!document || document.ownerId !== ownerId) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  documentStore.careflowDocuments!.delete(document.id); return NextResponse.json({ ok: true });
}
