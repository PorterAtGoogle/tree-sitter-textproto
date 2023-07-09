module.exports = grammar({
  name: 'textproto',

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => repeat($.field),

    field: $ => choice($.message_field, $.scalar_field),

    message_field: $ => seq(
      $.field_name,
      optional(":"),
      choice($.message_value, $.message_list),
      optional(choice(";", ",")),
    ),

    message_value: $ => choice(
      seq(
	$.open_bracket,
	repeat($.field),
	$.close_bracket,
      ),
      seq(
	$.open_arrow,
	repeat($.field),
	$.close_arrow,
      )
    ),

    message_list: $ => prec(2, seq(
      "[", // TODO give name
      optional(
	seq(
	  $.message_value,
	  repeat(
	    seq(
	      ",",
	      $.message_value,
	    ),
	  ),
	),
      ),
      "]",
    )),

    open_bracket: $ => '{',
    close_bracket: $ => '}',
    open_arrow: $ => '<',
    close_arrow: $ => '>',

    scalar_field: $ => seq(
      $.field_name,
      ":",
      choice(
	$.scalar_value,
	$.scalar_list,
      ),
      optional(choice(";", ",")),
    ),

    field_name: $ => choice(
      $.extension_name,
      $.any_name,
      $.identifier,
    ),

    extension_name: $ => seq(
      "[",
      $.type_name,
      "]",
    ),

    any_name: $ => seq(
      "[",
      $.domain,
      "/",
      $.type_name,
      "]",
    ),

    type_name: $ => seq(
      $.identifier,
      repeat(choice(".", $.identifier)),
    ),
    domain: $ => seq(
      $.identifier,
      repeat(choice(".", $.identifier)),
    ),

    identifier: $ => /[A-Za-z_][A-Za-z0-9_]*/,

    scalar_value: $ => choice(
      $.string,
      $.number,
      // TODO
    ),

    scalar_list: $ => prec(1, seq(
      "[",
      optional(
	seq(
	  $.scalar_value,
	  repeat(
	    seq(
	      ",",
	      $.scalar_value,
	    ),
	  ),
	),
      ),
      "]",
    )),

    string: $ => choice(
      $.single_string,
      $.double_string,
    ),

    single_string: $ => seq(
      "'",
      repeat(choice(
	$.string_escape,
	$.single_string_contents,
      )),
      "'",
    ),

    double_string: $ => seq(
      '"',
      repeat(choice(
	$.string_escape,
	$.double_string_contents,
      )),
      '"',
    ),

    single_string_contents: $ => /[^\n'\\]+/,
    double_string_contents: $ => /[^\n"\\]+/,

    oct: $ => /[0-7]/,
    hex: $ => /[0-9A-Fa-f]/,
    string_escape: $ => choice(
      "\\a",
      "\\b",
      "\\f",
      "\\n",
      "\\r",
      "\\t",
      "\\v",
      "\\?",
      "\\\"",
      "\\'",
      '\\"',
      seq("\\", $.oct, optional($.oct), optional($.oct)),
      seq("\\x", $.hex, optional($.hex)),
      seq("\\u", $.hex, $.hex, $.hex, $.hex),
      seq("\\U000", $.hex, $.hex, $.hex, $.hex, $.hex),
      seq("\\U010", $.hex, $.hex, $.hex, $.hex),
    ),

    number: $ => choice(
      $.dec_int,
      $.oct_int,
      $.hex_int,
      $.float
    ),

    dec_int: $ => choice(
      "0",
      seq(
	/[1-9]/,
	optional(/\d+/),
      ),
    ),
    oct_int: $ => seq(
      "0",
      $.oct,
      optional($.oct),
    ),
    hex_int: $ => seq(
      "0",
      choice("X", "x"),
      $.hex,
      optional($.hex),
    ),
    float: $ => choice(
      seq(
	".",
	/\d+/,
	optional($.exp)
      ),
      seq(
	$.dec_int,
	".",
	/\d+/,
	optional($.exp)
      ),
      seq(
	$.dec_int,
	$.exp
      )
    ),
    exp: $ => seq(
      /[Ee][-+]?/,
      /\d+/,
    ),

    comment: $ => seq('#', /.*/)
  },
  
  extras: $ => [
    /\s/,
    $.comment,
  ],
  precedences: $ => [
    ["message_list", "scalar_list"],
  ],
});
