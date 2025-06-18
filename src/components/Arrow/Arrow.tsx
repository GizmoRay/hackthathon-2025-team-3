"use client";

import { FC } from "react";
import Image from "next/image";

interface ArrowProps {
	size: number;
	color?: string;
}

const Arrow: FC<ArrowProps> = ({ size, color }) => {
	return (
		<Image
			src="/arrow-right-long.svg"
			alt="Right arrow icon"
			width={size}
			height={size}
			// style based on color if set to "white" or "black"
			style={{
				filter: `invert(${color === "white" ? 1 : 0})`,
			}}
		/>
	);
};

export default Arrow;
