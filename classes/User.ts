class User {
	constructor(
		public id: number,
		public role: string,
		public imie: string,
		public nazwisko: string,
		public login: string,
		public supervisingClass: any = null,
		public studentclass: any = null,
		public subjects: any[] | null = null,
		public grades: any[] | null = null
	) {
		this.id = id;
		this.role = role;
		this.imie = imie;
		this.nazwisko = nazwisko;
		this.login = login;
		this.supervisingClass = supervisingClass;
		this.studentclass = studentclass;
		this.subjects = subjects;
		this.grades = grades;
	}

	static empty() {
		return new User(0, "", "", "", "");
	}
}

export default User;