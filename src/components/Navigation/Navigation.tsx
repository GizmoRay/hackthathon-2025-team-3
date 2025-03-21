"use client";

import { FC } from "react";
import styles from "./Navigation.module.css";
import Image from "next/image";
const Navigation: FC = () => {
	return (
		<nav className={styles.nav}>
			<div className={styles.container}>
				<div className={styles.logo}>
					<Image
						src="/Stars.svg"
						alt="ServiceNow Intelligent Style Guide"
						width={21}
						height={21}
					/>
				</div>
				<div className={styles.title}>ServiceNow Intelligent Style Guide</div>
			</div>
		</nav>
	);
};

export default Navigation;
