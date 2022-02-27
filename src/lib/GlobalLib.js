
export const sortDayIndonesia=(day)=> {
    switch (day) {
            case '0':
            return 'Ming'
            case '1':
                return 'Sen'
                case '2':
            return 'Sel'
            case '3':
            return 'Rab'
            case '4':
            return 'Kam'
            case '5':
            return 'Jum'
            case '6':
            return 'Sab'
        default:
            return 'IN'
    }
}

export const fullDayIndonesia=(day)=> {
    switch (day) {
            case '0':
            return 'Minggu'
            case '1':
                return 'Senin'
                case '2':
            return 'Selasa'
            case '3':
            return 'Rabu'
            case '4':
            return 'Kamis'
            case '5':
            return 'Jumat'
            case '6':
            return 'Sabtu'
        default:
            return 'INVALID'
    }
}