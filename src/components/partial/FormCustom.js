import DatePicker, { registerLocale } from "react-datepicker";
import {useFormikContext, useField} from 'formik';
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import CurrencyInput from 'react-currency-input-field';
import id from 'date-fns/locale/id';

registerLocale('id', id)

export const DatePickerField = ({ ...props }) => {
    const { setFieldValue } = useFormikContext();
    const [field] = useField(props);
    return (
      <DatePicker
        locale="id"
        {...field}
        {...props}
        className='form-control'
        peekNextMonth
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        dateFormat="dd-MM-yyyy"
        isClearable
        selected={(field.value && new Date(field.value)) || null}
        onChange={(val) => {
          setFieldValue(field.name, val);
        }}
      />
    );
  };

  export const DatePickerFieldCustom = ({ ...props }) => {
    return (
      <DatePicker
        locale="id"
        name={props.name}
        selected={props.value}
        placeholderText={props.placeholder}
        className='form-control'
        peekNextMonth
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        dateFormat="dd-MM-yyyy"
        isClearable
        onChange={props.onChange}
      />
    );
  };

  export const DatePickerFieldRange = ({name, onChange, value}) => {
    const [startDate, endDate] = value;
    return (
      <DatePicker
        name={name}
        selectsRange={true}
        startDate={startDate}
        endDate={endDate}
        onChange={onChange}
        className="form-control"
        dateFormat="dd/MM/yyyy"
        withPortal
        isClearable={true}
      />
    );
  }

  export const TimePickerField = ({ name, label, className , onChange, value}) => {
    return (
      <DatePicker
        locale="id"
        name={name}
        className={className}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={5}
        timeCaption={label}
        placeholderText={label}
        dateFormat="HH:mm"
        isClearable
        onChange={onChange}
        selected={value}
      />
    );
  };

  export const SelectFieldCustom = ({ name, option, multi, search, defaultVal, onChange}) => {

    return (
      <Select
            name={name}
            className="basic-multi-select"
            classNamePrefix="select"
            defaultValue={defaultVal}
            isClearable={true}
            isSearchable={search}
            isMulti={multi}
            options={option}
            onChange={onChange}
          />
    );
  };

  export const SelectField = ({ name, value, multi, search, defaultVal}) => {
    const { setFieldValue } = useFormikContext();
    const [field] = useField(name);
    return (
      <Select
        {...field}
            name={name}
            className="basic-single"
            classNamePrefix="select"
            defaultValue={{...defaultVal}}
            isClearable={true}
            isSearchable={search}
            isMulti={multi}
            options={value}
            onChange={(val) => {
              setFieldValue(field.name, val);
            }}
          />
    );
  };

  export const CurrencyField = ({ name, value, limit}) => {
    const { setFieldValue } = useFormikContext();
    const [field] = useField(name);
    return (
      <input
      {...field}
        type="text"
        className="form-control"
        name={name}
        />
        // <CurrencyInput
        //   {...field}
        //   className="form-control"
        //   name={name}
        //   defaultValue={1000000}
        //   decimalsLimit={limit}
        //   onValueChange={(value, name) => {
        //     setFieldValue(field.name, value);
        //     //console.log(value+' : '+name);
        //   }}
        // />
    );
  };