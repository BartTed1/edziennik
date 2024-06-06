'use client'

import "./Login.sass"
import Input from "@/components/Input/Input"
import {ButtonType, Icons, InputType, UserType} from "@/types/types"
import Button from "@/components/Button/Button"
import React, {useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";

export default function Login() {
	const [login, setLogin] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [response, setResponse] = useState<string | null>(null);
	const [logging, setLogging] = useState<boolean>(false);
	const searchParams = useSearchParams()
	const redirectTo = searchParams.get("redirect")

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLogging(true);

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					login,
					password
				})
			})
			if (response.status === 403) {
				setResponse("Niepoprawne dane logowania");
				setLogging(false);
				return;
			}
			const data = await response.json();
			const token = data.token.split(".")[1];
			const decoded = JSON.parse(atob(token));
			const { sub, iat, exp } = decoded;
			localStorage.setItem("token", data.token);
			localStorage.setItem("role", sub as UserType);
			localStorage.setItem("iat", iat);
			localStorage.setItem("exp", exp);
			localStorage.setItem("imie", data.user.imie);
			localStorage.setItem("nazwisko", data.user.nazwisko);
			window.location.href = redirectTo ? redirectTo : "/dziennik";
		} catch (e) {
			setLogging(true);
			setResponse("Błąd serwera");
		}
	}

	useEffect(() => {
		localStorage && localStorage.clear();
	}, [])

	return (
		<main className="login">
			<form onSubmit={handleSubmit}>
				<h1>Logowanie</h1>
				<br/>
				<div>
					<label htmlFor="login">Login</label>
					<Input value={login} onValueChange={(e) => setLogin(e.target.value)} type={InputType.TEXT} name="login" required={true} placeholder="Wpisz login" />
				</div>
				<div>
					<label htmlFor="password">Hasło</label>
					<Input value={password} onValueChange={(e) => setPassword(e.target.value)} type={InputType.PASSWORD} name="password" required={true} placeholder="Wpisz hasło" />
				</div>
				{
					response === null ? <p></p> : <p className="error">{response}</p>
				}
				<Button type={ButtonType.SUBMIT} value="Zaloguj" disabled={logging || (login === "" || password === "")}/>
			</form>
		</main>
	);
}