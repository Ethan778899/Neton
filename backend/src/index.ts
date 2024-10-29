import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { TonProofService } from "./service";
import { TonApiService } from "./service/ton-api-service";
import { CheckProofRequest } from "./dto/check-proof-request-dto";
import { createPayloadToken, verifyToken, createAuthToken } from "./utils/jwt";

const port = 3000;
const app = new Hono();

app.use("/api/*", cors());

app.post("/api/generatePayload", async (c) => {
	const tonProofService = new TonProofService();
	const payload = tonProofService.generatePayload();
	const payloadToken = await createPayloadToken({ payload: payload });

	return c.json({ tonProof: payloadToken });
});

app.post("/api/checkProof", async (c) => {
	try {
		const tonProofService = new TonProofService();
		const body = CheckProofRequest.parse(await c.req.json());
		const client = TonApiService.create(body.network);
		const isValid = await tonProofService.checkProof(body, (address) => client.getWalletPublicKey(address));
		const payloadToken = body.proof.payload;

		if (!isValid) {
			return c.json({ message: "Invalid proof", ok: false }, 400);
		}

		if (!(await verifyToken(payloadToken))) {
			return c.json({ message: "Invalid token", ok: false }, 400);
		}

		const token = await createAuthToken({ address: body.address, network: body.network });

		return c.json({ token });
	} catch (err) {
		return c.json({ message: "Invalid request", ok: false }, 400);
	}
});

console.log(`Server is running on port ${port}`);
serve({ fetch: app.fetch, port });
