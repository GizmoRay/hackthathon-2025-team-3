"use client";

import { FC, ReactNode } from "react";
import styles from "./Sidebar.module.css";

interface SidebarProps {
	title?: string;
	type?: "stats" | "list";
	children: ReactNode;
	className?: string;
}

const Sidebar: FC<SidebarProps> = ({
	title,
	type = "stats",
	children,
	className = "",
}) => {
	return (
		<div className={`${styles.sidebar} ${styles[type]} ${className}`}>
			{title && <h2 className={styles.title}>{title}</h2>}
			<div className={styles.content}>{children}</div>
		</div>
	);
};

export default Sidebar;
