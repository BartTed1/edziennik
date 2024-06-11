'use client'

import {useCallback, useEffect, useRef, useState} from "react";
import News from "@/classes/News";
import "./aktualnosci.sass";
import loading from "@/assets/icons/universal/loading.svg";
import Loading from "@/components/Loading/Loading";
import useRole from "@/utils/useRole";
import {UserType} from "@/types/types";

export default function Aktualnosci() {
	const isAdmin = useRole(UserType.ADMIN)
	const isTeacher = useRole(UserType.TEACHER)

	const [news, setNews] = useState<News[] | null>(null)
	const [isFetching, setIsFetching] = useState(false)
	const [selectedNewsId, setSelectedNewsId] = useState<number | null>(null)
	const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false)
	const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)

	const getNews = useCallback(async () => {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news?sort=created,desc`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${localStorage.getItem("token")}`
			}
		})
		if (!response.ok) {
			console.error(response.statusText)
			return
		}
		const data = await response.json()
		setNews(data.content)
	}, [])

	useEffect(() => {
		getNews()
	}, []);

	useEffect(() => {
		const intersectionObserver = new IntersectionObserver((entries) => {
			if (entries.some(entry => entry.isIntersecting)) {
				if (typeof window === 'undefined') return
				if (news && news.length % 20 !== 0) return
				loadMore()
			}
		}, {
			rootMargin: "0px",
			threshold: 1
		})

		const target = document.getElementById("intersection-target")

		if (target) {
			intersectionObserver.observe(target)
		}
	}, [news]);

	const loadMore = async () => {
		if (!news) return
		setIsFetching(true)
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news?sort=created,desc&page=${news.length / 20}`,{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${localStorage.getItem("token")}`
			}
		})
		if (!response.ok) {
			console.error(response.statusText)
			return
		}
		const data = await response.json()
		setIsFetching(false)
		setNews([...news, ...data.content])
	}



	return (
		<div className={"container aktualnosci"}>
			<RemoveModal id={selectedNewsId} isVisible={isRemoveModalVisible} setIsVisible={setIsRemoveModalVisible} fetchNews={getNews}/>
			<CreateNewsModal isVisible={isCreateModalVisible} setIsVisible={setIsCreateModalVisible} fetchNews={getNews}/>
			<h1>Aktualności</h1>
			{
				isAdmin || isTeacher ? (
					<div className={"button-set"}>
						<button className={"button"} onClick={() => setIsCreateModalVisible(true)}>Dodaj</button>
					</div>
				) : null
			}
			{
				news ? news.length === 0 ? (
					<p>Brak aktualności</p>
				) : news.map((n: News) => (
					<div
						id={news.length === news.indexOf(n) + 1 ? "intersection-target" : ""}
						key={n.id}
						className={"aktualnosci__news"}
					>
						<h2>{n.tittle}</h2>
						<div className={"aktualnosci__row"}>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path
									d="M5 22C4.45 22 3.97917 21.8042 3.5875 21.4125C3.19583 21.0208 3 20.55 3 20V6C3 5.45 3.19583 4.97917 3.5875 4.5875C3.97917 4.19583 4.45 4 5 4H6V2H8V4H16V2H18V4H19C19.55 4 20.0208 4.19583 20.4125 4.5875C20.8042 4.97917 21 5.45 21 6V11.675C20.6833 11.525 20.3583 11.4 20.025 11.3C19.6917 11.2 19.35 11.125 19 11.075V10H5V20H11.3C11.4167 20.3667 11.5542 20.7167 11.7125 21.05C11.8708 21.3833 12.0583 21.7 12.275 22H5ZM18 23C16.6167 23 15.4375 22.5125 14.4625 21.5375C13.4875 20.5625 13 19.3833 13 18C13 16.6167 13.4875 15.4375 14.4625 14.4625C15.4375 13.4875 16.6167 13 18 13C19.3833 13 20.5625 13.4875 21.5375 14.4625C22.5125 15.4375 23 16.6167 23 18C23 19.3833 22.5125 20.5625 21.5375 21.5375C20.5625 22.5125 19.3833 23 18 23ZM19.675 20.375L20.375 19.675L18.5 17.8V15H17.5V18.2L19.675 20.375Z" />
							</svg>
							<span>
								{
									n.created ? new Date(n.created).toLocaleDateString() : "Brak daty"
								}
							</span>
						</div>
						<p dangerouslySetInnerHTML={{__html: n.contents}}></p>
						{
							isAdmin ? (
								<div className="button-set" style={{alignSelf: "flex-end"}}>
									<button className="button" onClick={() => {
										setSelectedNewsId(n.id)
										setIsRemoveModalVisible(true)
									}}>Usuń
									</button>
								</div>
							) : null
						}
					</div>
				)) : <Loading text={"Ładowanie"}/>
			}
			{
				isFetching ? (
					<Loading text={"Ładowanie"}/>
				) : null
			}
		</div>
	)
}

function RemoveModal({id, isVisible, setIsVisible, fetchNews}: {id: number | null, isVisible: boolean, setIsVisible: (isVisible: boolean) => void, fetchNews: () => void}) {
	const [isRemoving, setIsRemoving] = useState(false)
	const dialogRef = useRef<HTMLDialogElement>(null)

	async function removeNews() {
		setIsRemoving(true)
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news/${id}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${localStorage.getItem("token")}`
			}
		})
		if (!response.ok) {
			console.error(response.statusText)
			return
		}
		fetchNews()
		setIsRemoving(false)
		setIsVisible(false)
	}

	useEffect(() => {
		if (isVisible) {
			dialogRef.current?.showModal()
		} else {
			dialogRef.current?.close()
		}
	}, [isVisible]);

	return (
		<dialog className={"modal"} ref={dialogRef}>
			<h2>Czy na pewno chcesz usunąć tę aktualność?</h2>
			<div style={{display: "flex", flexDirection: "column"}}>
				<div className={"button-set"} style={{alignSelf: "flex-end"}}>
					<button className={"button"} onClick={() => setIsVisible(false)}>Anuluj</button>
					<button className={"button error"} onClick={removeNews}>Usuń</button>
				</div>
			</div>
		</dialog>
	)
}

function CreateNewsModal({isVisible, setIsVisible, fetchNews}: {isVisible: boolean, setIsVisible: (isVisible: boolean) => void, fetchNews: () => void}) {
	const [isCreating, setIsCreating] = useState(false)
	const dialogRef = useRef<HTMLDialogElement>(null)
	const [tittle, setTittle] = useState("")
	const [contents, setContents] = useState("")

	async function createNews() {
		setIsCreating(true)
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${localStorage.getItem("token")}`
			},
			body: JSON.stringify({
				tittle,
				contents
			})
		})
		if (!response.ok) {
			console.error(response.statusText)
			return
		}
		fetchNews()
		setIsCreating(false)
		setIsVisible(false)
		setTittle("")
		setContents("")
	}

	useEffect(() => {
		if (isVisible) {
			dialogRef.current?.showModal()
		} else {
			dialogRef.current?.close()
		}
	}, [isVisible]);

	return (
		<dialog className={"modal"} ref={dialogRef}>
			<div style={{display: "flex", flexDirection: "column", gap: "20px"}}>
				<h2>Dodaj nową aktualność</h2>
				<div className="button-set w100">
					<div className={"w100"}>
						<label htmlFor="title">
							Tytuł
						</label>
						<input placeholder={"Tytuł"} className={"input w100 only"} type="text" id="title" value={tittle}
									 onChange={(e) => setTittle(e.target.value)}/>
					</div>
				</div>
				<div className="button-set w100">
					<div className={"w100"}>
						<label htmlFor="contents">
							Treść
						</label>
						<div contentEditable={true} className={"textarea w100 only"} id="contents"
							onInput={(e) => setContents((e.target as HTMLElement).innerHTML)}
						>
						</div>
					</div>
				</div>
				<div className={"button-set"} style={{alignSelf: "flex-end"}}>
					<button className={"button"} onClick={() => setIsVisible(false)}>Anuluj</button>
					<button className={"button primary"} onClick={createNews} disabled={!(tittle && contents)}>Dodaj</button>
				</div>
			</div>
		</dialog>
	)
}