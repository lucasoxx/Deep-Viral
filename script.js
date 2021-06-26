		Vue.use(VueLazyload, {
			observer: true,
		})
		new Vue({
			el: "#app",
			data() {
				return {
					filtro: "tiempo",
					seleccionado: {},
					trending_topics: [],
				}
			},
			mounted() {
				this.leer_csv();
			},
			methods: {
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
						if (
							strMatchedDelimiter.length &&
							strMatchedDelimiter != strDelimiter
						) {
							// Since we have reached a new row of data,
							// add an empty row to our data array.
							arrData.push([]);
						}

						// Now that we have our delimiter out of the way,
						// let's check to see which kind of value we
						// captured (quoted or unquoted).
						if (arrMatches[2]) {
							// We found a quoted value. When we capture
							// this value, unescape any double quotes.
							let strMatchedValue = arrMatches[2].replace(
								new RegExp('""', "g"),
								'"'
							);
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
				async leer_csv() {
					try {
						const response = await fetch("300_tendencias_by_porquetendencia.csv")
						// const response = await fetch("1500-tendencias-clasificadas.csv")
						console.log(response)
						let text = await response.text()
						console.log(this.CSVToArray(text))
						text = this.CSVToArray(text)
						text.shift(0)
						// Por defecto estan ordenados por tiempo
						this.trending_topics = text.map(([id, tendencia, explicacion, url, media, time, suceso]) => ({
							id,
							tendencia,
							explicacion,
							url,
							media,
							time,
							suceso
						}))
						console.log(new Set(this.trending_topics.map(tt => tt.suceso)))
					} catch (error) {
						console.error(error)
					}
				}		
			},
			computed: {
				colores() {
					return {
						deportivo: "#5fad56", //
						covid: "#235789", //
						aislado: "#72405c", //
						"artístico": "#fb4d3d", //
						conmemorativo: "#8ddbe0", //
						"trágico": "#d97e18", //
						"político": "#f1d302", //
						"mediático": "#c0180c", //
					}
				},
				sucesos() {
					const listaDeSucesos = {
						deportivo: [],
						covid: [],
						aislado: [],
						"artístico": [],
						conmemorativo: [],
						"trágico": [],
						"político": [],
						"mediático": [],
					};
					this.trending_topics.forEach(tt => listaDeSucesos[tt.suceso].unshift(tt));
					return listaDeSucesos;
				},
				ordenados() {
					if (this.filtro === "tiempo") {
						return this.trending_topics
					} else {
						// Saca todos los valores de this.sucesos y les aplica un flatten (extrae todos los subelementos al array superior).
						return Object.values(this.sucesos).flat()
					}
				},
				rankingDePalabras(tweets) {
					let ranking = {};
					palabras = tweets;
					arrayPalabras = palabras.split(" ");
					for (let i = 0; i < arrayPalabras.length; i++){
					    palabra = arrayPalabras[i];
					    if (ranking[palabra]) {
					        ranking[palabra]++;
					    } else {
					        ranking[palabra] = 1;
					    }
					return ranking;
					}
				},
			}
		});
