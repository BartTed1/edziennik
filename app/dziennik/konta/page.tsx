'use client'

import usePermission from "@/utils/useRole";
import useRole from "@/utils/useRole";
import {UserType} from "@/types/types";
import Konta from "./konta";

export default function Page() {
	const isValidRole = useRole(UserType.ADMIN)

	return (
		<>
			{
				isValidRole ? (
					<Konta />
					) :
				isValidRole === null ? (
					<></>
					) : (
					<h1>Unauthorized</h1>
				)
			}
		</>
	);
}