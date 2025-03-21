"use client";

import { FC } from "react";
import styles from "./Skeleton.module.css";

interface SidebarProps {
	length: number;
}

const Sidebar: FC<SidebarProps> = ({ length }) => {
	return (
		<div className={styles.placeholder} style={{ width: length }}>
			<div className={styles.skeleton}></div>
		</div>
	);
};

export default Sidebar;
