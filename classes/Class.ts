class Class {
	id: number;
	name: string;
	supervising: User;
	students: User[];
	subjects: any[]; // Replace 'any' with the actual type of the subjects

	constructor(id: number, name: string, supervising: User, students: User[], subjects: any[]) {
		this.id = id;
		this.name = name;
		this.supervising = supervising;
		this.students = students;
		this.subjects = subjects;
	}
}

export default Class;