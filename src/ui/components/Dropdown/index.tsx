import { InputHTMLAttributes, ReactElement, useEffect } from "react";
import Select from "react-select";
import classNames from "classnames";
import { IconOption } from "./components/IconOption";
import "./dropdown.scss";

export type Option = {
  readonly value: string;
  readonly label: string;
  readonly icon: string | null;
}

type Props = {
  label?: string;
  errorMessage?: string;
  options: readonly Option[];
} & InputHTMLAttributes<HTMLSelectElement>;

export default function Dropdown(props: Props): ReactElement {
  const { label, errorMessage, className, ...selectProps } = props;
  return (
    <div className={classNames("dropdown", className)}>
      {label && <div className="dropdown__label">{label}</div>}
      <div className="dropdown__group">
        <Select
          classNamePrefix="dropdown"
          className="dropdown__container"
          closeMenuOnSelect={true}
          placeholder={"Choose"}
          options={props.options}
          components={{ Option: IconOption }}
        />
      </div>
      {errorMessage && <div className="dropdown__error-message">{errorMessage}</div>}
    </div>
  );
}
