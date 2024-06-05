import button from "@/components/Button/Button";
import Image from "next/image";
import "./HeaderButton.sass";
import {Dispatch, SetStateAction} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function HeaderButton({
	title,
	icon,
	filledIcon,
	active,
	changePathCallback,
}: Readonly<{ title: string, icon: string, filledIcon: string, active: string, changePathCallback: Dispatch<SetStateAction<string>> }>) {
	const router = useRouter()

	return (
		<Link href={`/dziennik/${title.toLowerCase()}`} passHref>
			<button
				onClick={() => {
					changePathCallback(title);
				}}
				className={`header__button${active === title ? "--active" : ""}`}>
				{
					active === title ? <Image src={filledIcon} alt={title} /> : <Image src={icon} alt={title} />
				}
				<span>{title}</span>
			</button>
		</Link>
	)
}

export default HeaderButton