'use client'

import {useEffect} from "react";

function AuthWrapper({ children }: Readonly<{ children: React.ReactNode }>){
	function watchAuth() {
		const token = localStorage.getItem("token");
		if (token === null) {
			const currentUrl = window.location.href;
			window.location.href = `/login?redirect=${currentUrl}`;
		}
	}

	useEffect(() => {
		watchAuth()
		window.addEventListener("storage", watchAuth)

		return () => {
			window.removeEventListener("storage", watchAuth)
		}
	}, [])

	return (
		<>
			{children}
		</>
	)
}

export default AuthWrapper