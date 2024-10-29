import { Button, Input, Form, Toast, Dialog } from "react-vant";
import { useTonWallet } from "@tonconnect/ui-react";
import toast from "react-hot-toast";
import { useSnapshot } from "valtio";
import { postCheckProof } from "@/http";
import { appStore } from "@/stores/app";
import { TabBar } from "@/components";

type FormData = {
	address: string;
	amount: string;
};

export default () => {
	const [form] = Form.useForm();
	const wallet = useTonWallet();
	const appStates = useSnapshot(appStore.states);

	const onFinish = async (formData: FormData) => {
		if (formData.address === undefined || formData.address.length === 0) {
			toast.error("Please enter a valid wallet address");
			return;
		}

		if (formData.amount === undefined || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
			toast.error("Please enter a valid amount");
			return;
		}

		const v = appStates.balance - Number(formData.amount);

		if (v < 0) {
			toast.error("Insufficient wallet balance");
			return;
		}

		const t = Toast.loading({
			message: "loading...",
			duration: 0,
		});
		try {
			console.log(wallet);
			const data = {
				address: wallet!.account.address,
				network: wallet!.account.chain,
				public_key: wallet!.account.publicKey,
				proof: {
					...(wallet!.connectItems?.tonProof as any).proof,
					state_init: wallet!.account.walletStateInit,
				},
			};

			const { token } = (await postCheckProof(data)) as any;

            Dialog.alert({
                style:'color:red;',
				title: "The Signature of Transfer",
				message: JSON.stringify({
					call_funciton: "process_ton_proof",
					proof_payload: {
						from: "pay.test.neton",
						to: "receive.test.netwon",
						action: "Transfer",
						value: 5,
					},
					signature: token,
					pub_key: wallet?.account.publicKey,
				}),
				confirmButtonText: "close",
			});
			setTimeout(() => {
				toast.success("Transfer successful");
				appStore.actions.setBalance(v);
			}, 1000 * 5);
		} catch (err) {
			toast.error("Transfer fail");
		}

		t.clear();
	};

	return (
		<div>
			<Form
				form={form}
				onFinish={onFinish}
				footer={
					<div style={{ margin: "16px 16px 0" }}>
						<Button round nativeType="submit" type="primary" block>
							Transfer
						</Button>
					</div>
				}
			>
				<Form.Item name="address" label="account">
					<Input placeholder="Please enter recipient account" />
				</Form.Item>
				<Form.Item name="amount" label="Amount">
					<Input placeholder="Please enter amount" />
				</Form.Item>
			</Form>

			<TabBar />
		</div>
	);
};
