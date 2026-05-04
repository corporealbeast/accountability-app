/**
 * One-time script: creates all Apex Peptides products in GHL
 * Run with: node webdev/apex-peptides/seed-products.mjs
 */

const TOKEN = "pit-4c894ab8-2194-46b6-9b4a-7745845d99cb";
const LOC   = "2tWDHL2abx9sjGrgieqN";
const BASE  = "https://services.leadconnectorhq.com";

const HEADERS = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
  Version: "2021-07-28",
};

const PRODUCTS = [
  { sku: "APX-001", name: "BPC-157",           price: 49.99,  desc: "Body Protection Compound. Accelerates tendon, ligament & gut healing.",                   vial: "5mg",   purity: "99.2%" },
  { sku: "APX-002", name: "TB-500",             price: 59.99,  desc: "Thymosin Beta-4 fragment. Systemic healing, angiogenesis & muscle repair.",               vial: "5mg",   purity: "99.0%" },
  { sku: "APX-003", name: "WOLVERINE",          price: 89.99,  desc: "BPC-157 + TB-500 dual-action recovery stack.",                                            vial: "5mg/5mg", purity: "99.0%" },
  { sku: "APX-004", name: "CJC-1295 DAC",       price: 54.99,  desc: "GHRH analogue with DAC. Sustained GH release, extended half-life.",                      vial: "5mg",   purity: "99.1%" },
  { sku: "APX-005", name: "IPAMORELIN",         price: 44.99,  desc: "Selective GH secretagogue. Clean GH pulse, no cortisol bleed.",                          vial: "5mg",   purity: "99.3%" },
  { sku: "APX-006", name: "IGF-1 LR3",          price: 74.99,  desc: "Long-acting IGF-1 analogue. Muscle hypertrophy, satellite cell activation.",              vial: "1mg",   purity: "98.8%" },
  { sku: "APX-007", name: "TESAMORELIN 5MG",    price: 64.99,  desc: "GHRH analogue. GH axis stimulator & visceral fat reduction.",                            vial: "5mg",   purity: "99.0%" },
  { sku: "APX-008", name: "TESAMORELIN 10MG",   price: 109.99, desc: "High-dose Tesamorelin for advanced GH optimization protocols.",                          vial: "10mg",  purity: "99.0%" },
  { sku: "APX-009", name: "FOLLISTATIN 344",    price: 149.99, desc: "Myostatin inhibitor. Muscle growth via ActRII pathway.",                                  vial: "1mg",   purity: "98.5%" },
  { sku: "APX-010", name: "SEMAGLUTIDE 5MG",    price: 89.99,  desc: "GLP-1 agonist management & metabolic regulation.",                                       vial: "5mg",   purity: "99.2%" },
  { sku: "APX-011", name: "SEMAGLUTIDE 10MG",   price: 149.99, desc: "High-dose Semaglutide for sustained GLP-1 metabolic benefit.",                          vial: "10mg",  purity: "99.2%" },
  { sku: "APX-012", name: "TIRZEPATIDE 5MG",    price: 109.99, desc: "Dual GIP/GLP-1 agonist. Outperforms semaglutide in weight loss trials.",                 vial: "5mg",   purity: "99.1%" },
  { sku: "APX-013", name: "TIRZEPATIDE 10MG",   price: 179.99, desc: "High-dose Tirzepatide for advanced dual-agonist protocols.",                             vial: "10mg",  purity: "99.1%" },
  { sku: "APX-014", name: "RETATRUTIDE",        price: 199.99, desc: "Triple GIP/GLP-1/Glucagon agonist. Next-gen metabolic compound.",                        vial: "10mg",  purity: "98.9%" },
  { sku: "APX-015", name: "MAZTUTIDE",          price: 129.99, desc: "GLP-1/GCG dual metabolic compound.",                                                     vial: "5mg",   purity: "99.6%" },
];

async function createProduct(p) {
  // 1. Create the product
  const productRes = await fetch(`${BASE}/products/`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      locationId: LOC,
      name: p.name,
      description: `${p.desc}\n\n${p.vial} vial · ${p.purity} purity · Lyophilized · SKU: ${p.sku}`,
      productType: "PHYSICAL",
      currency: "USD",
      isTaxesEnabled: false,
    }),
  });

  const productData = await productRes.json();

  if (!productRes.ok) {
    console.error(`  ✗ Failed to create product ${p.name}:`, JSON.stringify(productData));
    return null;
  }

  const productId = productData.product?._id ?? productData.product?.id ?? productData._id ?? productData.id;
  console.log(`  ✓ Product created: ${p.name} (${productId}) — raw keys: ${Object.keys(productData).join(", ")}`);

  // 2. Create the price for the product
  const priceRes = await fetch(`${BASE}/products/${productId}/price`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      locationId: LOC,
      name: "Per Vial",
      currency: "USD",
      amount: p.price,
      type: "one_time",
      compareAtPrice: null,
    }),
  });

  const priceData = await priceRes.json();

  if (!priceRes.ok) {
    console.error(`  ✗ Failed to create price for ${p.name}:`, JSON.stringify(priceData));
    return productId;
  }

  const priceId = priceData.price?.id ?? priceData.id;
  console.log(`  ✓ Price created: $${p.price} (${priceId})`);

  return productId;
}

async function main() {
  console.log(`\nSeeding ${PRODUCTS.length} products to GHL location ${LOC}...\n`);

  const results = [];
  for (const p of PRODUCTS) {
    console.log(`→ ${p.sku} ${p.name}`);
    const id = await createProduct(p);
    results.push({ sku: p.sku, name: p.name, id });
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 400));
  }

  console.log("\n── Summary ──────────────────────────────────");
  const succeeded = results.filter(r => r.id);
  const failed    = results.filter(r => !r.id);
  console.log(`✓ ${succeeded.length} products created`);
  if (failed.length) console.log(`✗ ${failed.length} failed:`, failed.map(r => r.name).join(", "));
  console.log("─────────────────────────────────────────────\n");
}

main().catch(console.error);
