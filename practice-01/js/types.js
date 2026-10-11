"use strict";

console.log('"8" + 2 =', "8" + 2, '| тип:', typeof ("8" + 2));
console.log('"8" - 2 =', "8" - 2, '| тип:', typeof ("8" - 2));
console.log('Number("8") + 2 =', Number("8") + 2, '| тип:', typeof (Number("8") + 2));
console.log('"12" > "3" =', "12" > "3", '| тип:', typeof ("12" > "3"));
console.log('12 === "12" =', 12 === "12", '| тип:', typeof (12 === "12"));
console.log('Number("") =', Number(""), '| тип:', typeof Number(""));
console.log('Number("text") =', Number("text"), '| тип:', typeof Number("text"));
console.log('Boolean("false") =', Boolean("false"), '| тип:', typeof Boolean("false"));
console.log('typeof null =', typeof null, '| тип результата:', typeof (typeof null));
console.log('typeof NaN =', typeof NaN, '| тип результата:', typeof (typeof NaN));