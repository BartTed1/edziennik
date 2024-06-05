/* eslint-disable @next/next/no-img-element */
import {ButtonType, Icons} from "@/types/types";
import "./Button.sass"

type ButtonProps = {
	type?: ButtonType
	icon?: Icons
	value: string
	disabled?: boolean
}
function Button({
	type = ButtonType.BUTTON,
	icon,
	value,
	disabled = false
} : ButtonProps) {
	if (icon) {
		return (
			<button type={type} className={`${disabled ? "button--disabled" : `button--${type}`}`}>
				<img src={icon} alt={value} />
				<p>{value}</p>
			</button>
		);
	} else {
		return (
			<button type={type} className={`${disabled ? "button--disabled" : `button--${type}`} button--without-icon `}>
				<p>{value}</p>
			</button>
		);
	}
}

export default Button