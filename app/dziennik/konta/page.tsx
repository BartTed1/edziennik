'use client'

import usePermission from "@/utils/useRole";
import useRole from "@/utils/useRole";

export default function Page() {
	const isValidRole = useRole("admin")

	return (
		<div>
			{
				isValidRole ? (
					<h1>Admins</h1>
				) : !isValidRole ? (
					<h1>Not an admin</h1>
				) : (
					<></>
				)
			}
		</div>
	);
}