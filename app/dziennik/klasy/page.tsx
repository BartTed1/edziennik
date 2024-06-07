'use client'

import useRole from "@/utils/useRole";
import {UserType} from "@/types/types";
import Klasy from "@/app/dziennik/klasy/klasy";

export default function Page() {
	const isValidRole = useRole(UserType.ADMIN)

	return (
		<>
			{
				isValidRole ? (
					<Klasy />
					) :
				isValidRole === null ? (
					<></>
					) : (
					<h1>Unauthorized</h1>
				)
			}
		</>
	)
}