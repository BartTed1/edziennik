import { useEffect, useState } from "react";
import {usePathname, useRouter} from "next/navigation";
import {UserType} from "@/types/types";

function useRole(role: UserType): boolean | null {
	const [isRole, setIsRole] = useState<boolean | null>(null);
	const router = useRouter();

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const storedRole = (localStorage.getItem("role") || "undefined") as UserType;
		setIsRole(storedRole === role);
	}, [role, router]);

	return isRole;
}

export default useRole;

