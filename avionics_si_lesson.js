"use strict";
/* Chapter 1 textbook-aligned teaching companion.
   The user's supplied Floyd/Buchla Base and Derived Units excerpt
   is the chapter reference. The historical classification is annotated
   using BIPM SI Brochure 9th ed. and NIST SP 811. All prose is original. */
(function(){
const base=[
 ["Length","meter","m"],
 ["Mass","kilogram","kg"],
 ["Time","second","s"],
 ["Electric current","ampere","A"],
 ["Thermodynamic temperature","kelvin","K"],
 ["Luminous intensity","candela","cd"],
 ["Amount of substance","mole","mol"]
];
const derived=[
 ["Electric potential difference","volt","V"],
 ["Electric charge","coulomb","C"],
 ["Resistance / impedance / reactance","ohm","Ω"],
 ["Capacitance","farad","F"],
 ["Inductance","henry","H"],
 ["Power","watt","W"],
 ["Energy / work","joule","J"],
 ["Frequency","hertz","Hz"],
 ["Conductance","siemens","S"],
 ["Magnetic flux","weber","Wb"],
 ["Magnetic flux density","tesla","T"]
];
const magnetic=[
 ["Magnetic field intensity","ampere per meter (turn treated as dimensionless)","A/m"],
 ["Magnetic flux","weber","Wb"],
 ["Magnetic flux density","tesla","T"],
 ["Magnetomotive force","ampere-turn","At"],
 ["Permeability","henry per meter","H/m"],
 ["Reluctance","ampere-turn per weber","At/Wb"]
];
const lesson={
 heading:"What makes a unit an SI base unit?",
 plain:"A base unit is one of seven fundamental measurement units in the International System of Units (SI). The ampere (A) is the base unit for electric current. The volt (V) is NOT a base unit: it is a derived unit made from combinations of SI base units.",
 analogy:"Treat the seven base units as a small set of building blocks. A derived unit describes something built by combining those blocks. For example, a volt combines other SI quantities instead of introducing an eighth fundamental unit.",
 why:"Before measuring a satellite circuit, know whether a symbol names a physical quantity, a measurement unit or a unit prefix. That prevents mistakes with current, voltage, powers of ten and equations.",
 example:"A lab report records electric current I = 0.025 A and voltage V = 5 V. The current is expressed using the SI base unit ampere. The voltage is expressed using the SI derived unit volt.",
 recap:"There are seven SI base units. Ampere is one of them. Volt is a derived unit. Milli and micro are prefixes, not base units.",
 words:[
 ["SI","International System of Units, an agreed measurement system."],
 ["Base unit","One of seven fundamental SI units, each associated with a base quantity."],
 ["Derived unit","An SI unit expressed using products and ratios of base units."],
 ["ampere (A)","Base unit for electric current."],
 ["volt (V)","Derived unit for electric potential difference."],
 ["prefix","A factor such as milli (10⁻³) or micro (10⁻⁶) that scales a unit."]
 ],
 base,derived,magnetic,
 historical:[
 ["Plane angle","radian","rad"],
 ["Solid angle","steradian","sr"]
 ],
 gaussNote:"The supplied textbook excerpt calls gauss a magnetic flux unit. In standard electromagnetic terminology, gauss (G) measures magnetic flux density: 1 G = 10⁻⁴ T. Maxwell (Mx) measures magnetic flux: 1 Mx = 10⁻⁸ Wb. This clarification comes from NIST/NBS tables, not a silent rewrite of the excerpt.",
 mksNote:"The textbook contrasts mks (meter–kilogram–second) engineering units with the older cgs (centimeter–gram–second) system. SI still has seven base units; mks names only three historically important base quantities.",
 note:"The quoted textbook uses the historical class 'supplementary units' for radian and steradian. The SI eliminated this separate category in 1995; today they are dimensionless derived units. Both descriptions refer to the same angle units, but to different SI classification periods.",
 styleNote:"In engineering typesetting, use italic quantity symbols such as I, V, P, and t. Use upright (roman) unit symbols such as A, V, W, and s. The same letter V can refer to a voltage quantity when italic and to the volt unit when upright.",
 sourceScope:"Aligned to the Base and Derived Units excerpt supplied from Chapter 1 of Principles of Electric Circuits (Floyd and Buchla). Historical SI status and modern unit symbols cross-checked against BIPM and NIST. Other chapters are original curriculum summaries, not verbatim textbook excerpts.",
 formulaMathml:'<math xmlns="http://www.w3.org/1998/Math/MathML" display="block" aria-label="One volt equals one watt divided by one ampere"><mrow><mn>1</mn><mspace width="0.2em"/><mi mathvariant="normal">V</mi><mo>=</mo><mfrac><mrow><mn>1</mn><mspace width="0.2em"/><mi mathvariant="normal">W</mi></mrow><mrow><mn>1</mn><mspace width="0.2em"/><mi mathvariant="normal">A</mi></mrow></mfrac></mrow></math>',
 baseFormulaMathml:'<math xmlns="http://www.w3.org/1998/Math/MathML" display="block" aria-label="One volt equals one kilogram meter squared per second cubed ampere"><mrow><mn>1</mn><mspace width="0.2em"/><mi mathvariant="normal">V</mi><mo>=</mo><mfrac><mrow><mn>1</mn><mspace width="0.2em"/><mi mathvariant="normal">kg</mi><mo>·</mo><msup><mi mathvariant="normal">m</mi><mn>2</mn></msup></mrow><mrow><msup><mi mathvariant="normal">s</mi><mn>3</mn></msup><mo>·</mo><mi mathvariant="normal">A</mi></mrow></mfrac></mrow></math>',
 symbolMathml:'<math xmlns="http://www.w3.org/1998/Math/MathML" display="block" aria-label="Italic electric current I equals twenty five milliamperes or zero point zero two five amperes"><mrow><mi>I</mi><mo>=</mo><mn>25</mn><mspace width="0.2em"/><mi mathvariant="normal">mA</mi><mo>=</mo><mn>0.025</mn><mspace width="0.2em"/><mi mathvariant="normal">A</mi></mrow></math>',
 symbolNote:"The first I is an italic quantity symbol for electric current. The upright A is the unit symbol for ampere; the upright m preceding A is the prefix milli, so mA means milliamperes. Multiply by 10⁻³ to convert: 25 mA = 0.025 A.",
 links:[
 ["BIPM SI Brochure, 9th edition","https://www.bipm.org/en/publications/si-brochure"],
 ["NIST SI base unit definitions","https://www.nist.gov/si-redefinition/definitions-si-base-units"],
 ["BIPM historical supplementary-unit decision","https://www.bipm.org/en/publications/si-brochure/annex-1/derived-units"],
 ["NIST SI symbol style","https://physics.nist.gov/cuu/Units/checklist.html"],
 ["NIST/NBS Magnetic Unit Conversions","https://www.govinfo.gov/content/pkg/GOVPUB-C13-aaf879474ebe03fd4c45a247d099163e/pdf/GOVPUB-C13-aaf879474ebe03fd4c45a247d099163e.pdf"]
 ]
};
window.AVIONICS_SI_LESSON=lesson;
})();