function translateRussianToEnglish(text) {
	const russianToEnglish = {
		'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
		'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
		'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
		'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
		'я': 'ya', 'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
		'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
		'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H',
		'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E',
		'Ю': 'Yu', 'Я': 'Ya'
	};

	return text.split('').map(function(char) {
		return russianToEnglish[char] || char;
	}).join('');
}

function translateEnglishToRussian(text) {
	const englishToRussian = {
		'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г', 'd': 'д', 'e': 'е', 'yo': 'ё', 'zh': 'ж',
		'z': 'з', 'i': 'и', 'j': 'й', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о',
		'p': 'п', 'r': 'р', 's': 'с', 't': 'т', 'u': 'у', 'f': 'ф', 'h': 'х', 'ts': 'ц',
		'ch': 'ч', 'sh': 'ш', 'shch': 'щ', 'y': 'ы', 'e': 'э', 'yu': 'ю', 'ya': 'я',
		'A': 'А', 'B': 'Б', 'V': 'В', 'G': 'Г', 'D': 'Д', 'E': 'Е', 'Yo': 'Ё', 'Zh': 'Ж',
		'Z': 'З', 'I': 'И', 'J': 'Й', 'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О',
		'P': 'П', 'R': 'Р', 'S': 'С', 'T': 'Т', 'U': 'У', 'F': 'Ф', 'H': 'Х', 'Ts': 'Ц',
		'Ch': 'Ч', 'Sh': 'Ш', 'Shch': 'Щ', 'Y': 'Ы', 'E': 'Э', 'Yu': 'Ю', 'Ya': 'Я'
	};

	return text.split('').map(function(char) {
		return englishToRussian[char] || char;
	}).join('');
}

console.log(translateRussianToEnglish('Привет, мир')); // Outputs: Privet, mir

console.log(translateEnglishToRussian('Tchaikovsky')); // Outputs: Чайковский

russian = [
"A", "А",
"а", "а",
"Б", "B",
"б", "b",
"В", "V",
"в", "v",
"Г", "G",
"г", "g",
"Д", "D",
"д", "d",
"Е", "E",
"е", "e",
"Ё", "O",
"ё", "o",
"Ж", "Zh",
"ж", "zh",
//	or like "g" in beige
"З", "Z",
"з", "z",
"И", "EE",
"и", "ee",
"Й", "I",
"й", "i",
//	like "y" in boy or toy
"К", "K",
"к", "k",
"Л", "L",
"л", "l",
"М", "M",
"м", "m",
"Н", "N",
"н", "n",
"О", "о",
//	Unstressed: A a	Like "o" in bore
//	Like "a" in car	"oh",
"П", "P",
"п", "p",
"Р", "R",
"р", "r",
"С", "S",
"с", "s",
"Т", "T",
"т", "t",
"У", "U",
"у", "u",
//	Like "oo" in boot	"oo",
"Ф", "F",
"ф", "f",
"Х", "H",
"х", "h",
//	KH kh	Like "h" in hello or like
//	the "ch" in Scottish 'loch' or German 'Bach'
"Ц", "TS",
"ц", "ts",
//	Like "ts" in bits
"Ч", "CH",
"ч", "ch",
//	Like "ch" in chip
"Ш", "SH",
"ш", "sh",
//	Like "sh" in shut
"Щ", "SH",
"щ", "sh",
//	Like "sh" in sheep
"Ъ", "",
"ъ", "",
// Hard Sign	Letter before is hard
"Ы", "I",
"ы", "i",
"Ь", "",
"ь", "",
//	Soft Sign	Letter before is soft
"Э", "E",
"э", "e",
"Ю", "YU",
"ю", "yu",
//	Like "u" in use or university
"Я", "YA",
"я", "ya",
//	Like "ya" in yard.
]
