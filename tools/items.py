import json
import struct
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'game/assets/data'
TABLES = [
 ('crew pay', 'PayTable', 0x51F6, 14, 0, ['monthly wage'], '1A7D'),
 ('ships', 'ShipTable', 0x52DE, 9, 29, ['drop ship parts','ship table weight','max weight','price','armor points','defence','size class','unknown column 7','base move','armor cost per point','tons per armor point','max fuel','unknown G28'], '29F8-2B99,5218'),
 ('shields', 'ShieldTable', 0x54B2, 5, 42, ['weight','price','strength'], '4D39-4DD5'),
 ('defense hardware', 'DefHwTable', 0x54EE, 5, 47, ['weight','price','percent'], '4E66-4EE9'),
 ('missile killers', 'MissileKillerTable', 0x552A, 3, 52, ['weight','price','percent'], '4F69-4FEC'),
 ('guns', 'GunTable', 0x554E, 25, 55, ['damage','shots','ammo capacity','weight','price','ammo price','ammo weight','accuracy'], '4911-4A59,4BCA-4C44'),
 ('squad weapons', 'WeaponTable', 0x586E, 54, 80, ['max damage','shots per round','magazine capacity','weight','range','damage type','ammo weight','ammo price','to hit bonus','price','intimidation','skill type'], '3C92-3EC0,405E-40D6; PLBATTLE 06CF4,067ED,0669A,068A6,0405B,056B3,06924'),
 ('hand weapons', 'HandWeaponTable', 0x628E, 6, 134, ['points','weight','to hit bonus'], '4270-430A'),
 ('sighting units', 'SightingTable', 0x62D6, 4, 140, ['weight','price','percent'], '436A-4452'),
 ('armor suits', 'ArmorSuitTable', 0x6306, 16, 144, ['armor points','price','weight'], '44C1-45D8'),
 ('misc items', 'MiscItemTable', 0x63C6, 11, 160, ['weight','price'], '46AA-473E'),
]

def f32(value):
    return struct.unpack('f', struct.pack('f', value))[0]


def main():
    info = json.loads((DATA / 'INFO.json').read_text())['values']
    names = json.loads((DATA / 'NAME.json').read_text())['fields']
    records = []
    for t, (group, array, base, count, namebase, columns, offsets) in enumerate(TABLES):
        table = t + (1 if t == 0 else 2)
        for i in range(count):
            fields, src = {}, {}
            for f, meaning in enumerate(columns):
                value = info[(base - 0x51F6)//4 + i + f*count]
                fields[meaning] = value
                source = f'STARPORT.bas.md Arrays {array}!(i, {f}) / INFO.BAS table {table} col {f}; statements {offsets}'
                src[meaning] = source
                if meaning == 'price':
                    fields['starport purchase price'] = f32(value * f32(1.2))
                    src['starport purchase price'] = source + '; PriceMul 076F-077B, PriceFactor 0791 (single precision)'
            if group == 'ships':
                fields['printed purchase price'] = math.floor(fields['starport purchase price'])
                src['printed purchase price'] = src['starport purchase price'] + '; 05227 PRINT INT(Price!)'
                fields['armor points per ton'] = math.floor(f32(1 / fields['tons per armor point']))
                src['armor points per ton'] = src['tons per armor point'] + '; STARPORT 0508B INT(1 / ShipTable!(i+90)), 02B44'
                fields['base weight'] = math.floor(f32(fields['ship table weight'] - f32(fields['armor points'] * fields['tons per armor point'])))
                src['base weight'] = 'STARPORT.bas.md 02A9C INT(ShipTable!(i+9)-ShipTable!(i+36)*ShipTable!(i+90)) / INFO.BAS table 3 cols 1,4,10 (single precision)'
                fields['cargo capacity'] = f32(fields['max weight'] - fields['base weight'])
                src['cargo capacity'] = src['base weight'] + '; SPACE.bas.md 08194 MaxWt!-BaseWt! / INFO.BAS table 3 col 2'
                fields['size class name'] = names[38 + int(fields['size class'])]
                src['size class name'] = src['size class'] + '; STARPORT 0308-0334 NAME fields 38..41 -> ShipSize$, 051D5'
            if group == 'squad weapons':
                damage_names = ['bullet', 'shotgun', 'needle', 'electricity', 'radiation', 'flame', 'rocket', 'chemical', 'explosive', 'nuclear', 'incendiary', 'laser']
                fields['damage kind'] = damage_names[int(fields['damage type']) - 1]
                src['damage kind'] = src['damage type'] + '; StarCommand_Manual_SSI1988 pp26-27 legend; PLBATTLE 08206,082E3-082ED (8 chemical); MANUAL_XCHECK C11,C50'
                fields['required skill'] = ['Heavy Arms', 'Light Arms', 'Chemical Weaponry', 'Explosives'][int(fields['skill type']) - 1]
                src['required skill'] = src['skill type'] + '; PLBATTLE.bas.md 068BA-06924 skill fields 25,24,22,21; MANUAL_XCHECK C50'
            if group == 'hand weapons':
                src['to hit bonus'] += '; STARPORT 0430A crew field 46, PLBATTLE 06887; MANUAL_XCHECK column meanings and C173'
            if 'ammo price' in fields:
                fields['starport ammo purchase price'] = f32(fields['ammo price'] * f32(1.2))
                statement = '0405E' if group == 'squad weapons' else '04BCA'
                src['starport ammo purchase price'] = src['ammo price'] + f'; STARPORT {statement} ammo price * PriceFactor!, 076F-077B,0791 (single precision)'
            records.append(dict(group=group,index=i,name=(('' if i == 0 else names[i-1]) if group == 'crew pay' else names[namebase+i]),fields=fields,src=src))
    (DATA / 'items.json').write_text(json.dumps(records, indent=2, ensure_ascii=True) + '\n', encoding='utf-8', newline='\n')

if __name__ == '__main__':
    main()
