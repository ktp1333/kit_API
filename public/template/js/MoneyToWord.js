function MoneyToWord() {}

MoneyToWord.execute = function(money) {
    var result = '';
    var minus = '';

    if (money < 0) {
        minus = 'ติดลบ';
        money = money * -1;
    }

    money = parseFloat(Math.round(money * 100) / 100).toFixed(2);

    if (money == '0.00') {
        result = 'ศูนย์บาทถ้วน';
        return result;
    }

    var numbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
    var positions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];

    var digit = money.length;
    var inputs = [];

    if (digit <= 15) {
        if (digit > 9) {
            inputs[0] = money.substr(0, digit - 9);
            inputs[1] = money.substr(inputs[0].length, 6);
        } else {
            inputs[0] = '00';
            inputs[1] = money.substr(0, money.length - 3);
        }
        inputs[2] = money.substr(money.indexOf('.') + 1, 2);
    } else {
        result = 'Error: ไม่สามารถรองรับจำนวนเงินที่เกินหลักแสนล้าน';
        return result;
    }

    for (i = 0; i < 3; i ++) {
        var input = inputs[i];

        if (input != '0' && input != '00') {
            var digit = input.length;

            for (j = 0; j < digit; j ++) {
                var s = input.substr(j, 1);
                var number = numbers[s];
                var position = '';

                if (number != '') {
                    position = positions[digit - (j + 1)];
                }

                if ((digit - j) == 2) {
                    if (s == '1') {
                        number = '';
                    } else if (s == '2') {
                        number = 'ยี่';
                    }
                } else if ((digit - j) == 1 && (digit != 1)) {
                    var pre_s = '0';
                    if (j > 0) {
                        pre_s = input.substr(j - 1, 1);
                    }

                    if (i == 0) {
                        if (pre_s != '0') {
                            if (s == '1') {
                                number = 'เอ็ด';
                            }
                        }
                    } else {
                        if (s == '1') {
                            number = 'เอ็ด';
                        }
                    }
                }

                result = result + number + position;
            }
        }

        if (i == 0) {
            if (input != '00') {
                result = result + 'ล้าน';
            }
        } else if (i == 1) {
            if (input != '0' && input != '00') {
                result = result + 'บาท';
                if (inputs[2] == '00') {
                    result = result + 'ถ้วน';
                }
            }
        } else {
            if (input != '00') {
                result = result + 'สตางค์';
            }
        }
    }

    return minus + result;
}