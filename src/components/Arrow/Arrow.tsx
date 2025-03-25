"use client";

import { FC } from "react";
import Image from "next/image";

interface ArrowProps {
	size: number;
}

const Arrow: FC<ArrowProps> = ({ size }) => {
	return (
		<Image
			src="/arrow-right-long.svg"
			alt="Right arrow icon"
			width={size}
			height={size}
		/>
	);
};

export default Arrow;
