import "./konta.sass";
import React, {Dispatch, SetStateAction, useCallback, useEffect, useRef, useState} from "react";
import {usePathname, useSearchParams, useRouter} from "next/navigation";
import Class from "@/classes/Class";
import User from "@/classes/User";
import {remove} from "immutable";
import {create} from "node:domain";

interface UserWrapper {
	tempId: number;
	user: User;
}

export default function Konta() {
	const [accounts, setAccounts] = useState<User[] | null>(null);
	const params = useSearchParams();
	const pathname = usePathname();
	const [page, setPage] = useState(1);
	const [role, setRole] = useState("");
	const [isAddModalOpened, setIsAddModalOpened] = useState(false);
	const addModalRef = useRef<HTMLDialogElement | null>(null);
	const [classes, setClasses] = useState<Class[] | null>(null);
	const [newUsersList, setNewUsersList] = useState<UserWrapper[]>([{tempId: 0, user: User.empty()}]);
	const router = useRouter();
	const [isAddModalDisabled, setIsAddModalDisabled] = useState(false);

	const fetchClasses = useCallback(async () => {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/class`, {
			headers: {
				"Authorization": `Bearer ${localStorage.getItem("token")}`
			}
		})
		if (response.status === 403) {
			localStorage.clear();
			window.location.href = "/login";
		}
		const data = await response.json();
		if (data) {
			setClasses(data.content);
		}
	}, [])

	const fetchAccounts = useCallback(async () => {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user?
			${role ? `role=${role}&` : ""}
			&page=${page}`, {
			headers: {
				"Authorization": `Bearer ${localStorage.getItem("token")}`
			}
		})
		if (response.status === 403) {
			localStorage.clear();
			window.location.href = "/login";
		}
		const data = await response.json();
		if (data) {
			setAccounts(data.content);
		}
	}, [page, role])

	const saveNewAccounts = async () => {
		const requestedUsers = newUsersList.map(wrapper => {
			const user = wrapper.user;
			return {
				role: user.role,
				imie: user.imie,
				nazwisko: user.nazwisko,
				studentclass: user.studentclass ? {id: user.studentclass.id} : null,
				supervisingClass: user.supervisingClass ? {id: user.supervisingClass.id} : null
			}
		});

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registerList`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${localStorage.getItem("token")}`
				},
				body: JSON.stringify(requestedUsers)
			})
			if (response.status === 403) {
				localStorage.clear();
				window.location.href = "/login";
			}
			const data = await response.json();
			if (data) {
				createAndDownloadCredentialListTxt(data);
			}
		} catch (e) {
			console.error(e);
		}
	}

	const createAndDownloadCredentialListTxt = (data: Array<User>) => {
		const formattedData = data.map((user: User) => {
			const columns = [
				{ label: 'Imię', value: user.imie },
				{ label: 'Nazwisko', value: user.nazwisko },
				{ label: 'Typ konta', value: user.role },
				{ label: 'Login', value: user.login },
				{ label: 'Hasło', value: user.password },
			];

			const longestValueLength = Math.max(...columns.map(column => column.value ? column.value.length : 0));

			const box = columns.map(column => {
				const paddedLabel = column.label.padEnd(longestValueLength, ' ');
				const paddedValue = column.value ? column.value.padEnd(longestValueLength, ' ') : '-'.repeat(longestValueLength);
				return `| ${paddedLabel} | ${paddedValue} |`;
			});

			return [
				'+-' + "edziennik".padEnd(longestValueLength, "-") + '-+-' + '-'.repeat(longestValueLength) + '-+',
				...box,
				'+-' + '-'.repeat(longestValueLength) + '-+-' + '-'.repeat(longestValueLength) + '-+',
				'\n'
			].join('\n');
		});

		const blob = new Blob([formattedData.join("")], {type: "text/plain"});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "lista_kont.txt";
		a.click();
		URL.revokeObjectURL(url);
	}

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const page = parseInt(params.get("page") || "0");
		const role = params.get("role") || "";

		setPage(page);
		setRole(role);

		fetchAccounts();
		fetchClasses();
	}, [params, fetchClasses])

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const current = new URLSearchParams(Array.from(params.entries()));
		current.set("page", page.toString());
		if (role) current.set("role", role);
		const search = current.toString();
		if (!search.length) return;
		router.push(`${pathname}?${search}`);
		setAccounts(null);
		fetchAccounts();
	}, [page, params, pathname, role, router])

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const modal = addModalRef.current;
		if (!modal) return;
		if (isAddModalOpened) modal.showModal()
		else modal.close();
	}, [isAddModalOpened])

	async function addAccount() {
		setNewUsersList(prevState => [...prevState, {tempId: Math.random(), user: User.empty()}])
	}

	return (
		<div className="container accounts">
			<dialog className={"modal"} ref={addModalRef} data-opened={isAddModalOpened}>
				<div className="modal__header">
					<div>
						<h2>Dodaj konto/a</h2>
						<p>Po dodaniu kont pobierze się lista loginów i haseł.<br /> Do każdego konta ucznia tworzy się konto rodzica.</p>
					</div>
					<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
							 onClick={() => setIsAddModalOpened(false)}>
						<path
							d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
							fill="#081234"/>
					</svg>
				</div>
				<form action="">
					{
						classes === null ? <div>Ładowanie listy klas...</div> : newUsersList.map((user, index) => (
							<NewUserFormElements classes={classes} key={user.tempId} index={index} user={user} modifyCallback={setNewUsersList} userListLength={newUsersList.length}/>
						))
					}
				</form>

				<div className="navigation">
					<div className="button-set">
						<button onClick={addAccount}>Dodaj następne konto</button>
						<button className={"primary"} onClick={saveNewAccounts} disabled={isAddModalDisabled}>Zapisz</button>
					</div>
				</div>
			</dialog>
			<h1>Konta</h1>
			<p>W tej sekcji można zarządzać kontami użytkowników</p>
			{
				accounts === null ? (
					<>
						<Navigation page={page} setPage={setPage} role={role} setRole={setRole} isNull={true}
												setIsModalOpened={setIsAddModalOpened}/>
						<div>Ładowanie...</div>
					</>
				) : (
					<>
						<Navigation page={page} setPage={setPage} role={role} setRole={setRole} isNull={accounts.length === 0} setIsModalOpened={setIsAddModalOpened}/>
						{
							accounts.length === 0 ? <div>Brak kont</div> : (
								<>
									<div className="table__wrapper">
										<table className={"table"}>
											<thead className="table__tint">
											<tr>
												<th>Lp.</th>
												<th>Typ konta</th>
												<th>ID</th>
												<th>Login</th>
												<th>Imię</th>
												<th>Nazwisko</th>
												<th>Klasa</th>
												<th style={{width: "1%", whiteSpace: "nowrap"}}>Akcje</th>
											</tr>
											</thead>
											<tbody>
											{
												accounts.map((account, index) => (
														<tr key={account.id} className="account">
															<td>{index + 1}</td>
															<td>{account.role}</td>
															<td>{account.id}</td>
															<td>{account.login}</td>
															<td>{account.imie}</td>
															<td>{account.nazwisko}</td>
															<td>
																{
																	account.role === "STUDENT" ? account.studentclass ? account.studentclass.name : "-" :
																		account.role === "TEACHER" ? account.supervisingClass ? account.supervisingClass.name : "-" :
																			"-"
																}
															</td>
															<td>
																<button>Edytuj</button>
															</td>
														</tr>
													)
												)
											}
											</tbody>
										</table>
									</div>
								</>
							)
						}
					</>
				)
			}
		</div>
	);
}

function Navigation({
	page,
	setPage,
	role,
	setRole,
	isNull,
	setIsModalOpened
} : {
	page: number,
	setPage: Dispatch<SetStateAction<number>>,
	role: string,
	setRole: Dispatch<SetStateAction<string>>,
	isNull: boolean,
	setIsModalOpened: Dispatch<SetStateAction<boolean>>
}) {
	return (
		<div className="navigation">
			<div className="button-set">
				<button onClick={() => setIsModalOpened(true)}>Dodaj konto/a</button>
			</div>
			<div className="button-set">
				<div>
					<label htmlFor="filter">
						Typ konta:
					</label>
					<select id={"filter"} className={"only"} value={role} onChange={(e) => {
						setRole(e.target.value)
					}}>
						<option value="">Wszyscy</option>
						<option value="ADMIN">Administratorzy</option>
						<option value="TEACHER">Nauczyciele</option>
						<option value="student">Uczniowie</option>
						<option value="parent">Rodzice</option>
					</select>
				</div>
			</div>
			<div className="button-set navigation__pages">
				{
					page > 0 && (
						<button onClick={() => {
							setPage(prevState => prevState - 1)
						}}>
							<svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M7.41 10.59L2.83 6L7.41 1.41L6 0L0 6L6 12L7.41 10.59Z" fill="#081234"/>
							</svg>
							Poprzednia strona
						</button>
					)
				}
				<button disabled={isNull} onClick={() => {
					setPage(prevState => prevState + 1)
				}}>
					Następna strona
					<svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M0.59 1.41L5.17 6L0.59 10.59L2 12L8 6L2 0L0.59 1.41Z" fill="#081234"/>
					</svg>
				</button>
			</div>
		</div>
	)
}

function NewUserFormElements({classes, user, index, modifyCallback, userListLength} : {classes: Class[], user: UserWrapper, index: number, modifyCallback: Dispatch<SetStateAction<UserWrapper[]>>, userListLength: number}) {
	const [role, setRole] = useState("");
	const [classId, setClassId] = useState(0);
	const [name, setName] = useState("");
	const [surname, setSurname] = useState("");

	useEffect(() => {
		setRole(user.user.role);
		setClassId(user.user.studentclass?.id || 0);
		setName(user.user.imie);
		setSurname(user.user.nazwisko);
	}, [])

	useEffect(() => {
		updateUser();

	}, [role, classId, name, surname, modifyCallback, index, classes])

	function updateUser() {
		console.log("changing:", user.tempId, role, classId, name, surname)
		modifyCallback(prevState => {
			const newState = [...prevState];
			newState.forEach((wrapper, i) => {
				if (wrapper.tempId === user.tempId) {
					wrapper.user.role = role;
					if (role === "STUDENT") {
						wrapper.user.supervisingClass = null;
						wrapper.user.studentclass = classes.find(c => c.id === classId) || null;
					}
					else if (role === "TEACHER") {
						wrapper.user.studentclass = null;
						wrapper.user.supervisingClass = classes.find(c => c.id === classId) || null;
					}
					wrapper.user.imie = name;
					wrapper.user.nazwisko = surname;
				}
			});
			return newState;
		})
	}

	function removeUser(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault()
		console.log("removing:", user.tempId)
		modifyCallback(prevState => prevState.filter((wrapper) => wrapper.tempId !== user.tempId))
	}

	return (
		<div className="button-set" data-user-id={user.tempId}>
			<div>
				{index === 0 && <label htmlFor="Lp.">Lp.</label>}
				<p id={"lp"}>{index + 1}</p>
			</div>
			<div>
				{index === 0 && <label htmlFor="">Typ konta:</label>}
				<select className={"first"} value={role} onChange={(e) => setRole(e.target.value)}>
					<option disabled={true} hidden={true} value="">Wybierz</option>
					<option value="STUDENT">Uczeń</option>
					<option value="TEACHER">Nauczyciel</option>
				</select>
			</div>
			<div>
				<div>
					{index === 0 && <label htmlFor="class">Klasa:</label>}
					<select id={"class"} value={classId} onChange={e => setClassId(parseInt(e.target.value))}>
						<option value="null">-</option>
						{
							classes?.map((c, index) => (
								<option key={index} value={c.id}>{c.name}</option>
							))
						}
					</select>
				</div>
			</div>
			<div>
				{index === 0 && <label htmlFor="name">Imie:</label>}
				<input type="text" id={"name"} value={name} onChange={(e) => setName(e.target.value)}/>
			</div>
			<div>
				{index === 0 && <label htmlFor="surname">Nazwisko:</label>}
				<input type="text" id={"surname"} value={surname} onChange={(e) => setSurname(e.target.value)}/>
			</div>
			<div>
				{index === 0 && <label htmlFor="actions">Akcje:</label>}
				<button className={"last error"} onClick={removeUser} disabled={userListLength <= 1}>Usuń</button>
			</div>
		</div>
	)
}