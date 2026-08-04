/**
 * HTTP verification against running Next.js server.
 * Usage: node scripts/verify-leads-api.mjs [baseUrl]
 */

const baseUrl = process.argv[2] ?? "http://127.0.0.1:3000";

const valid = {
  name: "Иван",
  phone: "+7 (900) 123-45-67",
  message: "",
  deviceType: "phone",
  contactPref: "phone",
  callback: false,
  consent: true,
  website: "",
};

async function post(body) {
  const response = await fetch(`${baseUrl}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const json = await response.json().catch(() => null);
  return { status: response.status, json };
}

const cases = [
  {
    name: "valid submit",
    body: valid,
    expectStatus: 201,
    expectOk: true,
  },
  {
    name: "resubmit (second valid)",
    body: { ...valid, name: "Мария", phone: "+79001112233" },
    expectStatus: 201,
    expectOk: true,
  },
  {
    name: "empty fields",
    body: { ...valid, name: "", phone: "" },
    expectStatus: 422,
    expectOk: false,
  },
  {
    name: "invalid phone",
    body: { ...valid, phone: "12" },
    expectStatus: 422,
    expectOk: false,
  },
  {
    name: "missing consent",
    body: { ...valid, consent: false },
    expectStatus: 422,
    expectOk: false,
  },
  {
    name: "bad json handled via invalid shape",
    body: null,
    raw: "not-json",
    expectStatus: 400,
    expectOk: false,
  },
  {
    name: "honeypot silent success",
    body: { ...valid, website: "http://bot.example" },
    expectStatus: 201,
    expectOk: true,
  },
];

async function run() {
  let failed = 0;

  for (const testCase of cases) {
    let result;
    if (testCase.raw) {
      const response = await fetch(`${baseUrl}/api/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: testCase.raw,
      });
      const json = await response.json().catch(() => null);
      result = { status: response.status, json };
    } else {
      result = await post(testCase.body);
    }

    const okField =
      result.json && typeof result.json === "object"
        ? result.json.ok === testCase.expectOk
        : false;
    const statusOk = result.status === testCase.expectStatus;
    const pass = okField && statusOk;

    if (!pass) failed += 1;
    console.log(
      `[${pass ? "PASS" : "FAIL"}] ${testCase.name} → ${result.status} ${JSON.stringify(result.json)}`,
    );
  }

  process.exit(failed === 0 ? 0 : 1);
}

run().catch((error) => {
  console.error("verify-leads-api failed:", error.message);
  process.exit(1);
});
