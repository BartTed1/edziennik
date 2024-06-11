import "./klasy.sass"
import React, {useCallback, useEffect, useRef, useState} from "react";
import Class from "@/classes/Class";
import User from "@/classes/User";
import Loading from "@/components/Loading/Loading";

export default function Klasy() {
	const [classes, setClasses] = useState<Class[] | null>(null)
	const [isChangeSupervisorModalOpen, setIsChangeSupervisorModalOpen] = useState(false)
	const [selectedClassId, setSelectedClassId] = useState(0)
	const [selectedClassName, setSelectedClassName] = useState("")
	const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
	const [isChangeClassNameModalOpen, setIsChangeClassNameModalOpen] = useState(false)
	const [isCreateNewClassModalOpen, setIsCreateNewClassModalOpen] = useState(false)

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
			<ChangeSupervisorModal isOpen={isChangeSupervisorModalOpen} setIsOpen={setIsChangeSupervisorModalOpen} classId={selectedClassId} className={selectedClassName} fetchClasses={fetchClasses}/>
			<AddStudentModal isOpen={isAddStudentModalOpen} setIsOpen={setIsAddStudentModalOpen} classId={selectedClassId} fetchClasses={fetchClasses}/>
			<ChangeClassNameModal isOpen={isChangeClassNameModalOpen} setIsOpen={setIsChangeClassNameModalOpen} classId={selectedClassId} className={selectedClassName} fetchClasses={fetchClasses}/>
			<CreateNewClassModal isOpen={isCreateNewClassModalOpen} setIsOpen={setIsCreateNewClassModalOpen} fetchClasses={fetchClasses}/>
			<h1>Klasy</h1>
			{
				classes === null ? <Loading text={"Ładowanie listy klas"} /> :
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
												<th>ID</th>
												<th>Imię ucznia</th>
												<th>Nazwisko</th>
												<th>Data urodzenia</th>
											</tr>
											</thead>
											<tbody>
											{
												c.students.map((s, index) => (
													<tr key={index}>
														<td>{index + 1}</td>
														<td>{s.id}</td>
														<td>{s.imie}</td>
														<td>{s.nazwisko}</td>
														<td>{s.birthDate}</td>
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
										<button className="button" onClick={
											_ => {
												setSelectedClassId(c.id)
												setIsAddStudentModalOpen(true)
											}
										}>Dodaj ucznia</button>
										<button className="button" onClick={
											_ => {
												setSelectedClassId(c.id)
												setSelectedClassName(c.name)
												setIsChangeClassNameModalOpen(true)
											}
										}>Zmień nazwę</button>
									</div>
								</div>
							</details>
						)
					)
			}
			<div className="button-set" style={{alignSelf: "flex-end"}}>
				<button className="button" onClick={() => setIsCreateNewClassModalOpen(true)}>
					Dodaj klasę
				</button>
			</div>
		</div>
	)
}

interface ChangeSupervisorModalProps {
	isOpen: boolean,
	setIsOpen: (value: boolean) => void
	classId: number
	className: string,
	fetchClasses: () => void
}

function ChangeSupervisorModal({isOpen, setIsOpen, classId, className, fetchClasses}: ChangeSupervisorModalProps) {
	const dialogRef = useRef<HTMLDialogElement>(null)
	const [teachers, setTeachers] = useState<User[] | null>(null)
	const [selectedTeacherId, setSelectedTeacherId] = useState("")

	const getTeachers = useCallback(async () => {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user?role=TEACHER&page=0&size=200&sort=nazwisko,desc`, {
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
		fetchClasses()
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
					teachers === null ? <Loading text={"Ładowanie listy nauczycieli"}/> :
						teachers.length === 0 ? <p>Brak dostępnych nauczycieli, ich konta utworzysz w module &ldquo;Konta&rdquo;</p> : (
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
			<button className={"button primary"} disabled={teachers === null || !teachers.length} type={"submit"} onClick={changeSupervisior}>Zapisz</button>
		</dialog>
	)
}

interface AddStudentModalProps {
	isOpen: boolean,
	setIsOpen: (value: boolean) => void
	classId: number,
	fetchClasses: () => void
}

function AddStudentModal({isOpen, setIsOpen, classId, fetchClasses}: AddStudentModalProps) {
	const dialogRef = useRef<HTMLDialogElement>(null)
	const [students, setStudents] = useState<User[] | null>(null)
	const [selectedStudentId, setSelectedStudentId] = useState<string>("")
	const [isSubmitLocked, setIsSubmitLocked] = useState(false)

	const getStudents = useCallback(async () => {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user?role=STUDENT`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${localStorage.getItem("token")}`
			}
		})
		if (!response.ok) {
			console.error("Error fetching students")
			return
		}
		const data = await response.json()
		if (!data) {
			console.error("Error fetching students")
			return
		}
		const studentsWithoutClass = data.content.filter((s: User) => s.studentclass === null)
		setStudents(studentsWithoutClass)
	}, [])

	useEffect(() => {
		if (!dialogRef.current) return
		if (isOpen) {
			dialogRef.current.showModal()
			getStudents()
		} else {
			dialogRef.current.close()
		}
	}, [isOpen]);

	const addStudent = async () => {
		setIsSubmitLocked(true)
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/class/${classId}/students`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${localStorage.getItem("token")}`
			},
			body: JSON.stringify([{
				id: selectedStudentId
			}])
		})
		if (!response.ok) {
			console.error("Error adding student")
			setIsSubmitLocked(false)
			return
		}
		fetchClasses()
		setIsOpen(false)
		setStudents(null)
		setSelectedStudentId("")
		setIsSubmitLocked(false)
	}

	return (
		<dialog className={"modal"} ref={dialogRef} data-opened={isOpen}>
			<div className="modal__header">
				<div>
					<h2>Dodaj uczniów</h2>
					<p>Aby przenieść przypisanego do klasy ucznia, skorzystaj z okna edycji ucznia w module klasy.</p>
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
					students === null ? <Loading text={"Ładowanie listy uczniów"}/> :
						students.length === 0 ? <p>Brak dostępnych uczniów, ich konta utworzysz w module &ldquo;Konta&rdquo;.</p> : (
							<div className="button-set w100">
								<div className={"w100"}>
									<label htmlFor="teacher">Nowy uczeń:</label>
									<select className={"select only w100"} value={selectedStudentId}
													onChange={e => setSelectedStudentId(e.target.value)}>
										<option hidden disabled value="">Wybierz</option>
										{
											students.map((s, index) => (
												<option key={index} value={s.id}>id: {s.id} {s.imie} {s.nazwisko}</option>
											))
										}
									</select>
								</div>
							</div>
						)
				}
			</form>
			<button className={"button primary"} disabled={students === null || isSubmitLocked || selectedStudentId === ""} type={"submit"} onClick={addStudent}>Dodaj
			</button>
		</dialog>
	)
}

interface ChangeClassNameModalProps {
	isOpen: boolean,
	setIsOpen: (value: boolean) => void
	classId: number,
	className: string,
	fetchClasses: () => void
}

function ChangeClassNameModal({isOpen, setIsOpen, classId, className, fetchClasses}: ChangeClassNameModalProps) {
	const dialogRef = useRef<HTMLDialogElement>(null)
	const [newClassName, setNewClassName] = useState(className)
	const [isSubmitLocked, setIsSubmitLocked] = useState(false)
	const [classSupervisor, setClassSupervisor] = useState<User | null>(null)

	const getClass = useCallback(async () => {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/class/${classId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${localStorage.getItem("token")}`
			},
		})
		if (!response.ok) {
			console.error("Error fetching class")
			return
		}
		const data = await response.json()
		if (!data) {
			console.error("Error fetching class")
			return
		}
		setClassSupervisor(data.supervising)
	}, [classId])

	const changeClassName = async () => {
		setIsSubmitLocked(true)
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/class/${classId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${localStorage.getItem("token")}`
			},
			body: JSON.stringify({
				name: newClassName,
				supervising: classSupervisor === null ? null : {id: classSupervisor.id}
			})
		})
		if (!response.ok) {
			console.error("Error changing class name")
			setIsSubmitLocked(false)
			return
		}
		fetchClasses()
		setIsOpen(false)
		setIsSubmitLocked(false)
	}

	useEffect(() => {
		if (!dialogRef.current) return
		if (isOpen) {
			dialogRef.current.showModal()
			setNewClassName(className)
			getClass()
		} else {
			dialogRef.current.close()
		}
	}, [isOpen]);

	return (
		<dialog className={"modal"} ref={dialogRef} data-opened={isOpen}>
			<div className="modal__header">
				<div>
					<h2>Zmień nazwę klasy</h2>
					<p>Wprowadź nową nazwę klasy.</p>
				</div>
				<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
						 onClick={() => setIsOpen(false)}>
					<path
						d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
						fill="#081234"/>
				</svg>
			</div>
			<form>
				<div className="button-set w100">
					<div className={"w100"}>
						<label htmlFor="teacher">Nowa nazwa klasy:</label>
						<input className={"input only w100"} type="text" value={newClassName} onChange={e => setNewClassName(e.target.value)}/>
					</div>
				</div>
			</form>
			<button
				className={"button primary"}
				disabled={isSubmitLocked || newClassName === "" || newClassName === className}
				type={"submit"}
				onClick={changeClassName}
			>
				Zapisz
			</button>
		</dialog>
	)
}

interface CreateNewClassModalProps {
	isOpen: boolean,
	setIsOpen: (value: boolean) => void,
	fetchClasses: () => void
}

function CreateNewClassModal({isOpen, setIsOpen, fetchClasses}: CreateNewClassModalProps) {
	const dialogRef = useRef<HTMLDialogElement>(null)
	const [className, setClassName] = useState("")
	const [isSubmitLocked, setIsSubmitLocked] = useState(false)

	const createClass = async () => {
		setIsSubmitLocked(true)
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/class`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${localStorage.getItem("token")}`
			},
			body: JSON.stringify({
				name: className,
				supervising: null
			})
		})
		if (!response.ok) {
			console.error("Error creating class")
			setIsSubmitLocked(false)
			return
		}
		fetchClasses()
		setIsOpen(false)
		setIsSubmitLocked(false)
	}

	useEffect(() => {
		if (!dialogRef.current) return
		if (isOpen) {
			dialogRef.current.showModal()
		} else {
			dialogRef.current.close()
		}
	}, [isOpen]);

	return (
		<dialog className={"modal"} ref={dialogRef} data-opened={isOpen}>
			<div className="modal__header">
				<div>
					<h2>Utwórz nową klasę</h2>
					<p>Wprowadź nazwę klasy.</p>
				</div>
				<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
						 onClick={() => setIsOpen(false)}>
					<path
						d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
						fill="#081234"/>
				</svg>
			</div>
			<form>
				<div className="button-set w100">
					<div className={"w100"}>
						<label htmlFor="class-name">Nazwa klasy:</label>
						<input id={"class-name"} className={"input only w100"} type="text" value={className} onChange={e => 		setClassName(e.target.value)}/>
					</div>
				</div>
			</form>
			<button
				className={"button primary"}
				disabled={isSubmitLocked || className === ""}
				type={"submit"}
				onClick={createClass}
			>
				Utwórz
			</button>
		</dialog>
	)
}