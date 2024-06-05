import "./Input.sass"
import React from "react";
import {InputType} from "@/types/types";
import "./Input.sass"

type InputProps = {
	type: InputType
	name: string
	required?: boolean,
	placeholder?: string
	value?: string | null
	onValueChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function Input({
	type = InputType.TEXT,
	name,
	required = false,
	placeholder,
	value,
	onValueChange,
}: InputProps) {
	if (onValueChange) {
		return (
			<input
				className="input"
				type={type}
				name={name}
				required={required}
				value={value || ''}
				onChange={onValueChange}
				placeholder={placeholder || ''}
			/>
		);
	} else {
		return (
			<input
				className="input"
				type={type}
				name={name}
				required={required}
				placeholder={placeholder || ''}
			/>
		);
	}
}
export default Input