/* 
 * Copyright (C) 2018 deroad
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

module.exports = (function() {
    var _internal_variable_cnt = 0;

    /**
     * Is used when there is an unknown assembly operation.
     * Operation: __asm(assembly)
     * 
     * @param {string} asm Assembly operation 
     */
    var _generic_asm = function(asm) {
        this.asm = asm;
        this.toString = function() {
            var t = context.printer.theme;
            var a = context.printer.auto;
            return t.callname('__asm') + ' (' + a(this.asm) + ')';
        }
    };

    /**
     * Assigns a source value to a destination value.
     * Operation: DST = SRC
     * 
     * @param {object} destination Destination value (can be also string type) 
     * @param {object} source Source value (can be also string type)
     */
    var _assignment = function(destination, source) {
        this.destination = destination;
        this.source = source;
        this.toString = function() {
            if (this.destination == this.source) {
                return '';
            }
            return this.destination + ' = ' + this.source;
        };
    };

    /**
     * Assigns a source value to a destination value by casting it.
     * Operation: DST = (cast) SRC
     * 
     * @param {object} destination Destination value (can be also string type) 
     * @param {object} source Source value (can be also string type)
     * @param {string} cast Cast operation to perform
     */
    var _cast_value = function(destination, source, cast) {
        this.destination = destination;
        this.source = source;
        this.cast = cast;
        this.toString = function() {
            var t = context.printer.theme;
            return this.destination + ' = (' + t.types(this.cast) + ') ' + this.source;
        };
    };

    /**
     * Perform a math operation with the source value and assigns the result to
     * the destination value.
     * Operation: DST = (op) SRC
     * 
     * @param {object} destination Destination value (can be also string type) 
     * @param {object} source Source value (can be also string type)
     * @param {string} operation Math operation to perform
     */
    var _math_assignment = function(destination, source, operation) {
        this.destination = destination;
        this.source = source;
        this.operation = operation;
        this.toString = function() {
            return this.destination + ' = ' + this.operation + this.source;
        };
    };

    /**
     * Increments or Decrease by 1 a value.
     * Operation: DST++ or DST--
     * 
     * @param {object} destination Destination value (can be also string type) 
     * @param {string} operation Operation to show
     */
    var _generic_inc_dec = function(destination, operation) {
        this.destination = destination;
        this.operation = operation;
        this.toString = function() {
            return this.destination + this.operation;
        };
    };

    /**
     * Implements a generic math operation.
     * Operation:
     *     If DST == SRC_A:
     *        DST (op)= SRC_B
     *     Else:
     *        DST = SRC_A (op) SRC_B
     * 
     * @param {object} destination Destination value (can be also string type) 
     * @param {object} source_a Source A value (can be also string type)
     * @param {object} source_b Source B value (can be also string type)
     * @param {string} operation Math operation
     */
    var _generic_math = function(destination, source_a, source_b, operation) {
        this.destination = destination;
        this.source_a = source_a;
        this.source_b = source_b;
        this.operation = operation;
        this.toString = function() {
            if (this.source_a == this.source_b) {
                return this.destination + this.operation + '= ' + this.source_b;
            }
            return this.destination + ' = ' + this.source_a + ' ' + this.operation + ' ' + this.source_b;
        };
    };

    var _base = {
        add: function(destination, source_a, source_b) {
            if (destination == source_a && source_b == '1') {
                return new _generic_inc_dec(destination, '++');
            }
            return new _generic_math(destination, source_a, source_b, '+');
        },
        and: function(destination, source_a, source_b) {
            if (source_b == '0') {
                return new _assignment(destination, '0');
            }
            return new _generic_math(destination, source_a, source_b, '&');
        },
        assign: function(destination, source) {
            return new _assignment(destination, source);
        },
        subtract: function(destination, source_a, source_b) {
            if (destination == source_a && source_b == '1') {
                return new _generic_inc_dec(destination, '--');
            }
            return new _generic_math(destination, source_a, source_b, '-');
        },
        or: function(destination, source_a, source_b) {
            if (source_a == source_b) {
                return new _assignment(destination, '0');
            }
            return new _generic_math(destination, source_a, source_b, '|');
        },
        xor: function(destination, source_a, source_b) {
            if (source_a == source_b) {
                return new _assignment(destination, '0');
            }
            return new _generic_math(destination, source_a, source_b, '^');
        },
        unknown: function(asm) {
            return new _generic_asm(asm);
        }
    };
    return _base;
})();