'use client'

/* eslint-disable */
import { UserType } from '@/types/types'
import Image from "next/image"
import "./Header.sass"
import HeaderButton from "@/components/HeaderButton/HeaderButton";
import lekcjeOutlined from "@/assets/icons/outlined/lekcje.svg"
import lekcjeFilled from "@/assets/icons/filled/lekcje.svg"
import uczniowieOutlined from "@/assets/icons/outlined/uczniowie.svg"
import uczniowieFilled from "@/assets/icons/filled/uczniowie.svg"
import kontaOutlined from "@/assets/icons/outlined/konta.svg"
import kontaFilled from "@/assets/icons/filled/konta.svg"
import klasyOutlined from "@/assets/icons/outlined/klasy.svg"
import klasyFilled from "@/assets/icons/filled/klasy.svg"
import aktualnosciOutlined from "@/assets/icons/outlined/aktualnosci.svg"
import aktualnosciFilled from "@/assets/icons/filled/aktualnosci.svg"
import logout from "@/assets/icons/universal/logout.svg"
import {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {Simulate} from "react-dom/test-utils";
import toggle = Simulate.toggle;


function Header() {
	const [activeMenu, setActiveMenu] = useState("")
	const [role, setRole] = useState("")
	const [name, setName] = useState("")
	const [surname, setSurname] = useState("")
	const headerRef = useRef<HTMLElement | null>(null)
	const navRef = useRef<HTMLElement | null>(null)

	useEffect(() => {
		if (typeof window === 'undefined') return
		const role = localStorage.getItem("role")
		if (!role) {
			window.location.href = "/login?redirect=" + window.location.href
			return
		}
		setRole(role)
		setName(localStorage.getItem("imie") || "Użytkownik")
		setSurname(localStorage.getItem("nazwisko") || "")

		handleScroll()
		window.addEventListener("scroll", handleScroll)
		return () => window.removeEventListener("scroll", handleScroll)
	}, [])

	function handleScroll() {
		const header = headerRef.current
		if (header) {
			if (window.scrollY > 0) {
				header.classList.add("header--scrolled");
			} else {
				header.classList.remove("header--scrolled");
			}
		}
	}

	function toggleMenu() {
		const nav = navRef.current
		if (nav) {
			nav.classList.toggle("header__nav--open")
		}
	}

	function onAnchorInMenuClick() {
		const nav = navRef.current
		if (nav) {
			nav.classList.remove("header__nav--open")
		}
	}

	useEffect(() => {
		if (typeof window === 'undefined') return
		const nav = navRef.current
		if (nav) {
			nav.addEventListener("click", onAnchorInMenuClick)
		}
	}, []);


  return (
		<header className="header" ref={headerRef}>
			<Link href={"/dziennik"} onClick={() => setActiveMenu("Home")} className="header__logo">
				<img src="" alt="eDziennik"/>
			</Link>
			<nav className="header__nav" ref={navRef}>
				<div className="header__nav__mobile-header">
					<Link href={"/dziennik"} onClick={() => setActiveMenu("Home")} className="header__logo">
						<img src="" alt="eDziennik"/>
					</Link>
					<div className="header__nav__mobile-header__burger" onClick={toggleMenu}>
						<div className="header__nav__mobile-header__burger__line"></div>
						<div className="header__nav__mobile-header__burger__line"></div>
						<div className="header__nav__mobile-header__burger__line"></div>
					</div>
				</div>
				<div className={"header__nav-content"}>
					{
						role === "admin" ? (
							<>
								<HeaderButton title="Konta" icon={kontaOutlined} filledIcon={kontaFilled} active={activeMenu}
															changePathCallback={setActiveMenu}/>
								<HeaderButton title="Klasy" icon={klasyOutlined} filledIcon={klasyFilled} active={activeMenu}
															changePathCallback={setActiveMenu}/>
								<HeaderButton title={"Aktualności"} icon={aktualnosciOutlined} filledIcon={aktualnosciFilled}
															active={activeMenu} changePathCallback={setActiveMenu}/>
							</>) : role === "teacher" ? (
							<>
								<HeaderButton title="Lekcje" icon={lekcjeOutlined} filledIcon={lekcjeFilled} active={activeMenu}
															changePathCallback={setActiveMenu}/>
								<HeaderButton title="Uczniowie" icon={uczniowieOutlined} filledIcon={uczniowieFilled}
															active={activeMenu} changePathCallback={setActiveMenu}/>
							</>
						) : role === "student" || role === "parent" ? (
							<>

							</>
						) : null
					}
				</div>
				<div className="header__nav--bottom">
					<a href="/login">
						<Image src={logout} alt="Wyloguj"/>
						<span>Wyloguj</span>
					</a>
				</div>
			</nav>
			<div className="header__nav__mobile-header__burger" onClick={toggleMenu}>
				<div className="header__nav__mobile-header__burger__line"></div>
				<div className="header__nav__mobile-header__burger__line"></div>
				<div className="header__nav__mobile-header__burger__line"></div>
			</div>
			<div className="header__left">
				<div className="header__account--name">
					<p>{name} {surname}</p>
				</div>
				<div className="header__account--role">
					{
						role === "admin" ? (
							<p>Administrator</p>
						) : role === "teacher" ? (
							<p>Nauczyciel</p>
						) : role === "user" ? (
							<p>Uczeń</p>
						) : null
					}
				</div>
				<div className="header__account--logout">
					<a href="/login">
						<Image src={logout} alt="Wyloguj"/>
					</a>
				</div>
			</div>
		</header>
	)
}

export default Header