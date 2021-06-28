// Palabras no permitidas
const PALABRAS_FILTRADAS = [
	"a",
	"ante",
	"bajo",
	"cabe",
	"con",
	"contra",
	"de",
	"desde",
	"durante",
	"en",
	"entre",
	"hacia",
	"hasta",
	"mediante",
	"para",
	"por",
	"según",
	"sin",
	"so",
	"sobre",
	"tras",
	"versus",
	":",
	"|",
];

// Agregamos el "plugin" de VueLazyLoad a Vue para cargar imagenes de manera asincrona sin romper nada y no sobrecargar la memoria :D
Vue.use(VueLazyload, {
	observer: true,
});

// Creamos la instancia de la app de Vue
new Vue({
	el: "#app",
	data() {
		return {
			indice: 0,
			coleccion_de_tweets: {},
			filtro: "tiempo",
			seleccionado: {},
			trending_topics: [],
		};
	},
	mounted() {
		this.cargarTrendingTopics();
	},
	computed: {
		colores() {
			return {
				deportivo: "#5fad56", //
				covid: "#235789", //
				aislado: "#72405c", //
				artístico: "#fb4d3d", //
				conmemorativo: "#8ddbe0", //
				trágico: "#d97e18", //
				político: "#f1d302", //
				mediático: "#c0180c", //
			};
		},
		tweetsSeleccionados() {
			return (
				this.seleccionado?.tendencia &&
				this.coleccion_de_tweets[this.seleccionado.tendencia]
			);
		},
		ordenados() {
			if (this.filtro === "tiempo") {
				return this.trending_topics;
			} else {
				// Saca todos los valores de this.sucesos y les aplica un flatten (extrae todos los subelementos al array superior).
				return Object.values(this.sucesos).flat();
			}
		},
		sucesos() {
			const listaDeSucesos = {
				deportivo: [],
				covid: [],
				aislado: [],
				artístico: [],
				conmemorativo: [],
				trágico: [],
				político: [],
				mediático: [],
			};
			this.trending_topics.forEach((tt) =>
				listaDeSucesos[tt.suceso].unshift(tt)
			);
			return listaDeSucesos;
		},
	},
	watch: {
		seleccionado(current) {
			if (!this.seleccionado?.tendencia) this.indice = 0;
		},
	},
	methods: {
		shuffle(array) {
			const length = array == null ? 0 : array.length;
			if (!length) {
				return [];
			}
			let index = -1;
			const lastIndex = length - 1;
			const result = array.slice(0);
			while (++index < length) {
				const rand = index + Math.floor(Math.random() * (lastIndex - index + 1));
				const value = result[rand];
				result[rand] = result[index];
				result[index] = value;
			}
			return result;
		},
		
		CSVToArray(strData, strDelimiter) {
			// This will parse a delimited string into an array of
			// arrays. The default delimiter is the comma, but this
			// can be overriden in the second argument.
			// Check to see if the delimiter is defined. If not,
			// then default to comma.
			strDelimiter = strDelimiter || ",";
		
			// Create a regular expression to parse the CSV values.
			const objPattern = new RegExp(
				// Delimiters.
				"(\\" +
				strDelimiter +
				"|\\r?\\n|\\r|^)" +
				// Quoted fields.
				'(?:"([^"]*(?:""[^"]*)*)"|' +
				// Standard fields.
				'([^"\\' +
				strDelimiter +
				"\\r\\n]*))",
				"gi"
			);
		
			// Create an array to hold our data. Give the array
			// a default empty first row.
			const arrData = [[]];
		
			// Create an array to hold our individual pattern
			// matching groups.
			let arrMatches = null;
		
			// Keep looping over the regular expression matches
			// until we can no longer find a match.
			while ((arrMatches = objPattern.exec(strData))) {
				// Get the delimiter that was found.
				let strMatchedDelimiter = arrMatches[1];
		
				// Check to see if the given delimiter has a length
				// (is not the start of string) and if it matches
				// field delimiter. If id does not, then we know
				// that this delimiter is a row delimiter.
				if (strMatchedDelimiter.length && strMatchedDelimiter != strDelimiter) {
					// Since we have reached a new row of data,
					// add an empty row to our data array.
					arrData.push([]);
				}
		
				// Now that we have our delimiter out of the way,
				// let's check to see which kind of value we
				// captured (quoted or unquoted).
				let strMatchedValue;
		
				if (arrMatches[2]) {
					// We found a quoted value. When we capture
					// this value, unescape any double quotes.
					strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"');
				} else {
					// We found a non-quoted value.
					strMatchedValue = arrMatches[3];
				}
		
				// Now that we have our value string, let's add
				// it to the data array.
				arrData[arrData.length - 1].push(strMatchedValue);
			}
		
			// Return the parsed data.
			return arrData;
		},
		anterior() {
			this.indice--;
		},
		proximo() {
			this.indice++;
		},
		async cargarTrendingTopics() {
			try {
				const arrayTrendingTopics = await this.leer_csv(
					"300_tendencias_by_porquetendencia"
				);
				this.trending_topics = arrayTrendingTopics.map(
					([id, tendencia, explicacion, url, media, time, suceso]) => ({
						id,
						tendencia,
						explicacion,
						url,
						media,
						time,
						suceso,
					})
				);
				console.log(new Set(this.trending_topics.map((tt) => tt.suceso)));
			} catch (error) {
				console.error(error);
			}
		},
		async leer_csv(archivo = "") {
			const response = await fetch(`${archivo}.csv`);

			if (!response.ok)
				throw new Error(`¡No se encontró el archivo ${archivo}.csv!`);

			console.log(response);
			let text = await response.text();
			text = this.CSVToArray(text);
			text.shift(0);

			return text;
		},
		rankingDePalabras(palabras = "") {
			let ranking = {};

			let arrayPalabras = palabras
				.toLowerCase()
				// Separamos por estos caracteres (\s es por espacios, ya sean saltos de linea o tabs)
				.split(/[\s,!¡¿?;"”'`\\]+/)
				// Filtramos las palabras que existen y que no pertenecen al conjunto de palabras filtradas
				.filter((palabra) => palabra && !PALABRAS_FILTRADAS.includes(palabra));

			for (let i = 0; i < arrayPalabras.length; i++) {
				let palabra = arrayPalabras[i];
				if (!palabra) console.log(palabra, i);
				if (ranking[palabra]) {
					ranking[palabra]++;
				} else {
					ranking[palabra] = 1;
				}
			}
			return ranking;
		},
		async seleccionar(tt) {
			try {
				// Si no intentamos buscar el archivo csv de la tendencia, intententemos buscarlo
				if (this.coleccion_de_tweets[tt.tendencia] === undefined) {
					const csv = await this.leer_csv(tt.tendencia);
					let palabras = "";
					const tweets = csv.map(
						([id, tweet, likes, time, username, rtCount, media], indice) => {
							// Explicar esto:
							palabras += indice === 0 ? tweet : ` ${tweet}`;

							return {
								id,
								tweet,
								likes,
								media,
								rtCount,
								time,
								username,
							};
						}
					);

					const palabrasRankeadas = this.rankingDePalabras(palabras);

					const ordenadasPorRanking = Object.keys(palabrasRankeadas)
						// Ordenamos por las palabras que tienen mayor ranking
						.sort(
							(palabra1, palabra2) =>
								palabrasRankeadas[palabra2] - palabrasRankeadas[palabra1]
						)
						.slice(0, 19);

					this.coleccion_de_tweets[tt.tendencia] = {
						palabrasRankeadas,
						ordenadasPorRanking: this.shuffle(ordenadasPorRanking),
						tweets,
					};
				}
			} catch (error) {
				// Si cae acá, no existe el CSV, marcamos como que esa tendencia no tiene un csv, esto no se revalida porque ya sabemos que el CSV no se encontró
				this.coleccion_de_tweets[tt.tendencia] = false; // Le indicamos que el csv no existe
			}

			this.seleccionado = tt;
		},
	},
});
