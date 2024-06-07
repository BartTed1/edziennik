import "./klasy.sass"
import React, {useCallback, useEffect, useRef, useState} from "react";
import Class from "@/classes/Class";
import User from "@/classes/User";

export default function Klasy() {
	const [classes, setClasses] = useState<Class[]>([])
	const [isChangeSupervisorModalOpen, setIsChangeSupervisorModalOpen] = useState(false)
	const [selectedClassId, setSelectedClassId] = useState(0)
	const [selectedClassName, setSelectedClassName] = useState("")

	const fetchClasses = useCallback(async () => {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/class`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${localStorage.getItem("token")}`
			}
		})
		if (!response.ok) {
			console.error("Error fetching classes")
			return
		}
		const data = await response.json()
		if (!data) {
			console.error("Error fetching classes")
			return
		}
		const sortedByName = data.content.sort((a: Class, b: Class) => a.name.localeCompare(b.name))
		setClasses(sortedByName)
	}, [])

	useEffect(() => {
		fetchClasses()
	}, [])

	return (
		<div className={"container klasy"}>
			<ChangeSupervisorModal isOpen={isChangeSupervisorModalOpen} setIsOpen={setIsChangeSupervisorModalOpen} classId={selectedClassId} className={selectedClassName}/>
			<h1>Klasy</h1>
			{
				classes === null ? <h1>Trwa ładowanie...</h1> :
					classes.length === 0 ? <p>Brak klas</p> :
						classes.map((c, index) => (
							<details key={index} className={"details"}>
								<summary>Klasa {c.name}</summary>
								<div className={"details__content"}>
									<p>
										<b>Wychowawca: </b>
										{c.supervising === null ? <span>Brak</span> : (
											<span>{c.supervising.imie} {c.supervising.nazwisko}</span>
										)}
									</p>
									<p>
										<b>Uczniów: </b>
										<span>{c.students.length}</span>
									</p>
									<div className="table__wrapper">
										<table className={"table"}>
											<thead className={"table__tint"}>
											<tr>
												<th>Nr</th>
												<th>Imię ucznia</th>
												<th>Nazwisko</th>
											</tr>
											</thead>
											<tbody>
											{
												c.students.map((s, index) => (
													<tr key={index}>
														<td>{index + 1}</td>
														<td>{s.imie}</td>
														<td>{s.nazwisko}</td>
													</tr>
												))
											}
											</tbody>
										</table>
									</div>
									<div className="button-set" style={{alignSelf: "flex-end"}}>
										<button className="button" onClick={_ => {
											setSelectedClassId(c.id)
											setSelectedClassName(c.name)
											setIsChangeSupervisorModalOpen(true)
										}}
										>Zmień wychowawcę</button>
										<button className="button">Dodaj ucznia</button>
									</div>
								</div>
							</details>
						)
					)
			}
		</div>
	)
}

interface ChangeSupervisorModalProps {
	isOpen: boolean,
	setIsOpen: (value: boolean) => void
	classId: number
	className: string
}

function ChangeSupervisorModal({isOpen, setIsOpen, classId, className}: ChangeSupervisorModalProps) {
	const dialogRef = useRef<HTMLDialogElement>(null)
	const [teachers, setTeachers] = useState<User[] | null>(null)
	const [selectedTeacherId, setSelectedTeacherId] = useState("")

	const getTeachers = useCallback(async () => {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user?role=TEACHER`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${localStorage.getItem("token")}`
			}
		})
		if (!response.ok) {
			console.error("Error fetching teachers")
			return
		}
		const data = await response.json()
		if (!data) {
			console.error("Error fetching teachers")
			return
		}
		const teachersWithoutSupervisor = data.content.filter((t: User) => t.supervisingClass === null)
		setTeachers(teachersWithoutSupervisor)
	}, [])

	const changeSupervisior = async () => {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/class/${classId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${localStorage.getItem("token")}`
			},
			body: JSON.stringify({
				name: className,
				supervising: {id: selectedTeacherId}
			})
		})
		if (!response.ok) {
			console.error("Error changing supervisor")
			return
		}
		setIsOpen(false)
		setSelectedTeacherId("")
	}


	useEffect(() => {
		if (!dialogRef.current) return
		if (isOpen) {
			dialogRef.current.showModal()
			getTeachers()
		} else {
			dialogRef.current.close()
		}
	}, [isOpen]);



	return (
		<dialog className={"modal"} ref={dialogRef} data-opened={isOpen}>
			<div className="modal__header">
				<div>
					<h2>Zmień wychowawcę</h2>
					<p>Aktualny wychowawca zostanie odłączony od klasy.</p>
				</div>
				<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
						 onClick={() => setIsOpen(false)}>
					<path
						d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
						fill="#081234"/>
				</svg>
			</div>
			<form>
				{
					teachers === null ? <h1>Trwa ładowanie...</h1> :
						teachers.length === 0 ? <p>Brak dostępnych nauczycieli</p> : (
							<div className="button-set w100">
								<div className={"w100"}>
									<label htmlFor="teacher">Nowy wychowawca:</label>
									<select className={"select only w100"} value={selectedTeacherId} onChange={e => setSelectedTeacherId(e.target.value)}>
										<option hidden disabled value="">Wybierz</option>
										{
											teachers.map((t, index) => (
												<option key={index} value={t.id}>{t.imie} {t.nazwisko}</option>
											))
										}
									</select>
								</div>
							</div>
						)
				}
			</form>
			<button className={"button primary"} disabled={teachers === null} type={"submit"} onClick={changeSupervisior}>Zapisz</button>
		</dialog>
	)
}