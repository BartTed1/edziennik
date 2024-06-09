class News {
	id: number | null;
	tittle: string;
	contents: string;
	created: string | null;
	modified: string | null;

	constructor(tittle: string, contents: string, id: number | null = null, created: string | null = null, modified: string | null = null) {
		this.id = id;
		this.tittle = tittle; // Typo on server side
		this.contents = contents;
		this.created = created;
		this.modified = modified;
	}
}

export default News;