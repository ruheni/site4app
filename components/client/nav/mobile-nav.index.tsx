import Link from "next/link";
import styles from "./index.module.css";
import { FaArrowRight } from "react-icons/fa";
import { useApp } from "../app-provider";
import { cx } from "#/lib/front/cx";
import AppStoreBadge from "#/components/app-store-badge";

function MobileNavItem({ link, close }: { link: string, close: () => void }) {

	const { slug } = useApp();

	return <li className={styles.mobileItem}>
		<Link onClick={close} href={`/${slug}/${link}`} className={styles.mobileInner}>
			<span>{link}</span>
			<FaArrowRight />
		</Link>
	</li>
}

export function MobileNav({
	items,
	show,
	close
}: {
	items: string[];
	show: boolean;
	close: () => void;
}): JSX.Element {

	const { app_id } = useApp();

	return <ul className={cx(styles.mobileNav, show && styles.showMobileNav)}>
		{items.map((item) => <MobileNavItem close={close} key={item} link={item} />)}
		<Link className={styles.mobileBadge} href={`https://apps.apple.com/app/id${app_id}`}>
			<AppStoreBadge />
		</Link>
	</ul>
}