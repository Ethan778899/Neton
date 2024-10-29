import { Cell } from "react-vant";
import { useSnapshot } from "valtio";
import { useTonAddress } from "@tonconnect/ui-react";
import { TabBar } from "@/components";
import { appStore } from "@/stores/app";
import styles from "./index.module.less";

export default () => {
	const appStates = useSnapshot(appStore.states);
	const address = useTonAddress();

	return (
		<div className={styles.queryBalance}>
			<Cell.Group>
				<Cell title="Ton Address" label={address} />
				<Cell title="Near Vault Account" label="pay.test.neton" />
				<Cell title="$NEAR Balance" label={appStates.balance} />
			</Cell.Group>
			<TabBar />
		</div>
	);
};
