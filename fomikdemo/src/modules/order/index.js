import { Form, Formik, useFormik } from "formik";
import React, { useState } from "react";
import { Alert, Button, Col, Row } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import * as yup from "yup";
import * as contact from "./contact";
import * as cargo from "./cargo";
import * as options from "./options";
import OrderForm from "./orderForm";

const orderSchema = yup.object().shape({
    sender: yup.object().shape(contact.Schema),
    receiver: yup.object().shape(contact.Schema),
    cargo: yup.object().when(["sender", "receiver"], {
        is: (sender, receiver) => {
            console.log("sender", sender);
            console.log("receiver", receiver);
            return sender?.city !== "" && receiver?.city !== "" && sender?.city !== receiver?.city;
        },
        then: yup.object().shape({
            ...cargo.Schema,
            weight: cargo.Schema.weight.min(5, "Минимальный вес в междугородней отправке 5 кг"),
        }),
        otherwise: yup.object().shape({ ...cargo.Schema }),
    }),
    options: yup.object().shape(options.Sсhema),
});

const initialValues = {
    sender: { ...contact.InitialValues },
    receiver: { ...contact.InitialValues },
    cargo: { ...cargo.InitialValues },
    options: { ...options.InitialValues },
    isBusy: false,
};

const Order = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = (values, { setSubmitting }) => {
        console.log("values", values);
        setSubmitting(true);

        setShowAlert(false);
        setIsSubmitted(false);
        setTimeout(() => {
            const sizes = "Габариты: " + values.cargo.sizes.map((s) => `${s.l}x${s.w}x${s.h}см`).join(", ");
            setMessage(
                `Создано: <p>${values.sender.country}, ${values.sender.city} -> ${values.receiver.country}, ${
                    values.receiver.city
                }</p><p>Вес: ${values.cargo.weight}</p><p>${sizes}</p><p>Дата забора: ${
                    values.options.takeDate?._d.toLocaleDateString() || ""
                }</p>`
            );
            setSubmitting(false);
            setShowAlert(true);
            setIsSubmitted(true);
        }, 4000);
    };

    return (
        <Formik initialValues={initialValues} validationSchema={orderSchema} onSubmit={handleSubmit}>
            {(formik) => (
                <Form>
                    <OrderForm />

                    <Row className="my-3 justify-content-around">
                        <Col className="text-center">
                            <Button type="submit" color="primary" disabled={formik.isSubmitting}>
                                {formik.isSubmitting && <FontAwesomeIcon icon={faSpinner} spin className="me-1" />}
                                Создать
                            </Button>
                        </Col>
                        <Col className="text-center">
                            <Button
                                type="button"
                                disabled={formik.isSubmitting}
                                onClick={(e) => {
                                    formik.setSubmitting(true);
                                    handleSubmit(formik.values, formik);
                                }}
                            >
                                {formik.isSubmitting && <FontAwesomeIcon icon={faSpinner} spin className="me-1" />}
                                Создать черновик
                            </Button>
                        </Col>

                        {isSubmitted && (
                            <Col className="text-center">
                                <Button
                                    type="button"
                                    disabled={formik.isSubmitting}
                                    onClick={() => {
                                        setShowAlert(false);
                                        setIsSubmitted(false);
                                        formik.resetForm();
                                    }}
                                >
                                    Очистить
                                </Button>
                            </Col>
                        )}
                    </Row>
                    <Row>
                        <Alert isOpen={showAlert} color="success">
                            <div dangerouslySetInnerHTML={{ __html: message }} />
                        </Alert>
                    </Row>
                </Form>
            )}
        </Formik>
    );
};

export default Order;
