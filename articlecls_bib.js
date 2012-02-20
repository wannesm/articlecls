/*
 * Bibliography file for Article.js example.
 */


var bibabbr = {
	"default": {
		"container-title":{
			"Name of a Journal":"Name J.",
		},
		"collection-title":{
			"In Proceedings of an Interesting Conference":"IC"
		},
		"authority":{
			"United Nations": "U.N."
		},
		"institution":{
			"U.S. Bureau of the Census":"U.S. Bureau of the Census"
		},
		"title":{},
		"classic":{},
		"hereinafter":{},
		"nickname":{},
		"place":{}
	},
};

var bibdata = {
	"Meert2012" : {
		"id": "Meert2012",
		"title": "Some example reference title",
		"author": [
			{"family": "Meert", "given": "Wannes"},
			{"family": "Lastname", "given": "Firstname"},
		],
		"container-title":"One or Another Journal",
		"volume": "18",
		"page": "463-509",
		"issued": {
			"date-parts": [
				[2012]
			],
		},
		"type": "article-journal"
	},
	"Meert2011" : {
		"id": "Meert2011",
		"title": "A first title",
		"author": [
			{"family": "Meert", "given": "Wannes"},
		],
		"publisher": "MyPublisher",
        "publisher-place": "New York",
		"issued": {
			"date-parts": [
				[2011]
			],
		},
		"type": "book"
	}
};

// Extend the known citationstyles with a custom one (or taken from 
// https://github.com/citation-style-language/styles
citationstyles['myieee'] = "<style xmlns=\"http://purl.org/net/xbiblio/csl\" class=\"in-text\"><info>     <title>IEEE</title>     <id>http://www.zotero.org/styles/ieee</id>     <link href=\"http://www.zotero.org/styles/ieee\" />     <author>       <name>Michael Berkowitz</name>       <email>mberkowi@gmu.edu</email>     </author>     <contributor>       <name>Julian Onions</name>       <email>julian.onions@gmail.com</email>     </contributor>     <contributor>       <name>Rintze Zelle</name>       <uri>http://forums.zotero.org/account/831/</uri>     </contributor>     <category term=\"engineering\" />     <category term=\"generic-base\" />     <category term=\"numeric\" />     <updated />     <link href=\"http://www.ieee.org/portal/cms_docs_iportals/iportals/publications/authors/transjnl/stylemanual.pdf\" rel=\"documentation\" />   </info>   <macro name=\"author\">     <names variable=\"author\">       <name and=\"text\" delimiter=\", \" initialize-with=\".\"/>       <label form=\"short\" prefix=\", \" suffix=\".\" text-case=\"lowercase\" />       <substitute>         <names variable=\"editor\" />         <names variable=\"translator\" />       </substitute>     </names>   </macro>   <macro name=\"editor\">     <names variable=\"editor\">       <name and=\"text\" delimiter=\", \" initialize-with=\".\" name-as-sort-order=\"all\" />       <label form=\"short\" prefix=\", \" suffix=\".\" text-case=\"lowercase\" />     </names>   </macro>   <macro name=\"title\">     <choose>       <if type=\"book\">         <text font-style=\"italic\" variable=\"title\" />       </if>       <else>         <text quotes=\"true\" variable=\"title\" />       </else>     </choose>   </macro>   <macro name=\"publisher\">     <text prefix=\" \" suffix=\": \" variable=\"publisher-place\" />     <text suffix=\", \" variable=\"publisher\" />     <date variable=\"issued\">       <date-part name=\"year\" />     </date>   </macro>   <macro name=\"access\">     <text variable=\"URL\" />   </macro>   <macro name=\"page\">     <group>       <label form=\"short\" suffix=\". \" variable=\"page\" />       <text variable=\"page\" />     </group>   </macro>   <citation           collapse=\"citation-number\"          et-al-min=\"3\"          et-al-use-first=\"1\">     <sort>       <key variable=\"citation-number\" />     </sort>     <layout delimiter=\",\" prefix=\"[\" suffix=\"]\">       <text variable=\"citation-number\" />     </layout>   </citation>   <bibliography           entry-spacing=\"0\"          second-field-align=\"flush\">     <layout suffix=\".\">       <text prefix=\"[\" suffix=\"]\" variable=\"citation-number\" />       <text macro=\"author\" prefix=\" \" suffix=\", \" />       <choose>         <if type=\"book\">           <group delimiter=\", \">             <text macro=\"title\" />             <text macro=\"publisher\" />           </group>         </if>         <else-if type=\"chapter\">           <group delimiter=\", \">             <text macro=\"title\" />             <text font-style=\"italic\" variable=\"container-title\" form=\"short\"/>             <text macro=\"editor\" />             <text macro=\"publisher\" />             <text macro=\"page\" />           </group>         </else-if>         <else-if type=\"patent\">           <text macro=\"title\" suffix=\", \" />           <text prefix=\"U.S. Patent \" variable=\"number\" />           <date prefix=\", \" variable=\"issued\">             <date-part name=\"month\" suffix=\" \" />             <date-part name=\"day\" suffix=\", \" />             <date-part name=\"year\" />           </date>         </else-if>         <else-if type=\"thesis\">           <group delimiter=\", \">             <text macro=\"title\" />             <text variable=\"genre\" />             <text variable=\"publisher\" />             <date variable=\"issued\">               <date-part name=\"year\" />             </date>           </group>         </else-if>         <else>           <group delimiter=\", \">             <text macro=\"title\" />             <text font-style=\"italic\" variable=\"container-title\" form=\"short\"/>             <text prefix=\" vol. \" variable=\"volume\" />             <date variable=\"issued\">               <date-part form=\"short\" name=\"month\" suffix=\". \" />               <date-part name=\"year\" />             </date>             <text macro=\"page\" />           </group>         </else>       </choose>     </layout>   </bibliography> </style>";

