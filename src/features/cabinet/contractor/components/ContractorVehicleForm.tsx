import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  useEffect,
  useState,
} from 'react';

import {
  createDefaultVehicleProperties,
  type ContractorVehicleFormValue,
  type VehiclePropertiesFormValue,
  type VehicleType,
  type VehicleTypeOption,
} from '../model/contractor.types';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
}

function SelectField({
  label,
  value,
  placeholder = 'Выберите',
  options,
  disabled = false,
  onChange,
}: SelectFieldProps) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const selected =
    options.find(
      (option) =>
        option.value === value
    );

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
      </Text>

      <Pressable
        disabled={disabled}
        onPress={() =>
          setOpen(true)
        }
        style={[
          styles.select,
          disabled &&
            styles.disabled,
        ]}
      >
        <Text
          style={[
            styles.selectText,
            !selected &&
              styles.placeholder,
          ]}
        >
          {selected?.label ??
            placeholder}
        </Text>

        <Text style={styles.chevron}>
          ▼
        </Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setOpen(false)
        }
      >
        <Pressable
          onPress={() =>
            setOpen(false)
          }
          style={
            styles.selectBackdrop
          }
        >
          <Pressable
            onPress={() => {}}
            style={
              styles.selectModal
            }
          >
            <Text
              style={
                styles.selectModalTitle
              }
            >
              {label}
            </Text>

            <ScrollView
              style={
                styles.selectOptions
              }
            >
              {options.map(
                (option) => (
                  <Pressable
                    key={
                      option.value
                    }
                    onPress={() => {
                      onChange(
                        option.value
                      );
                      setOpen(
                        false
                      );
                    }}
                    style={[
                      styles.selectOption,
                      option.value ===
                        value &&
                        styles.selectOptionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        option.value ===
                          value &&
                          styles.selectOptionTextActive,
                      ]}
                    >
                      {
                        option.label
                      }
                    </Text>
                  </Pressable>
                )
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

interface BooleanFieldProps {
  label: string;
  value: boolean;
  disabled?: boolean;
  onChange: (
    value: boolean
  ) => void;
}

function BooleanField({
  label,
  value,
  disabled = false,
  onChange,
}: BooleanFieldProps) {
  return (
    <View
      style={
        styles.booleanField
      }
    >
      <Text
        style={
          styles.booleanLabel
        }
      >
        {label}
      </Text>

      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onChange}
      />
    </View>
  );
}

interface Props {
  vehicleTypes: VehicleTypeOption[];
  initialValue?: ContractorVehicleFormValue;
  loadingTypes?: boolean;
  submitting?: boolean;
  errorMessage?: string;
  submitLabel?: string;
  submittingLabel?: string;
  onSubmit: (
    value: ContractorVehicleFormValue
  ) => void;
  onCancel: () => void;
}

function createEmptyForm(): ContractorVehicleFormValue {
  return {
    model: '',
    license_plate: '',
    properties: {
      type: '',
    },
  };
}

function cloneForm(
  value: ContractorVehicleFormValue
): ContractorVehicleFormValue {
  return {
    model: value.model,
    license_plate:
      value.license_plate,
    properties: {
      ...value.properties,
    },
  };
}

export function ContractorVehicleForm({
  vehicleTypes,
  initialValue,
  loadingTypes = false,
  submitting = false,
  errorMessage = '',
  submitLabel = 'Добавить технику',
  submittingLabel = 'Добавляем…',
  onSubmit,
  onCancel,
}: Props) {
  const [
    form,
    setForm,
  ] = useState<
    ContractorVehicleFormValue
  >(
    initialValue
      ? cloneForm(initialValue)
      : createEmptyForm()
  );

  const [
    validationError,
    setValidationError,
  ] = useState('');

  useEffect(() => {
    if (initialValue) {
      setForm(
        cloneForm(initialValue)
      );
    }
  }, [initialValue]);

  useEffect(() => {
    if (
      !form.properties.type &&
      vehicleTypes[0]
    ) {
      setVehicleType(
        vehicleTypes[0].value
      );
    }
  }, [vehicleTypes]);

  function setVehicleType(
    type: VehicleType
  ) {
    setForm((current) => ({
      ...current,
      properties:
        createDefaultVehicleProperties(
          type
        ),
    }));

    setValidationError('');
  }

  function setProperty(
    name: string,
    value:
      | string
      | number
      | boolean
  ) {
    setForm((current) => ({
      ...current,
      properties: {
        ...current.properties,
        [name]: value,
      },
    }));

    setValidationError('');
  }

  function validate() {
    if (!form.properties.type) {
      return 'Выберите тип техники';
    }

    if (!form.model.trim()) {
      return 'Укажите модель техники';
    }

    if (
      !form.license_plate.trim()
    ) {
      return 'Укажите госномер техники';
    }

    return '';
  }

  function handleSubmit() {
    const error = validate();

    setValidationError(error);

    if (error) {
      return;
    }

    onSubmit({
      model: form.model.trim(),
      license_plate:
        form.license_plate.trim(),
      properties: {
        ...form.properties,
      },
    });
  }

  const type =
    form.properties.type;

  const typeOptions =
    vehicleTypes.map(
      (option) => ({
        value: option.value,
        label: option.label,
      })
    );

  const numberOptions = (
    values: number[],
    suffix: string
  ): SelectOption[] =>
    values.map((value) => ({
      value: String(value),
      label: `${value} ${suffix}`,
    }));

  return (
    <View style={styles.form}>
      <SelectField
        label="Тип техники"
        value={type}
        options={typeOptions}
        disabled={
          loadingTypes ||
          submitting
        }
        placeholder={
          loadingTypes
            ? 'Загрузка…'
            : 'Выберите тип'
        }
        onChange={(value) =>
          setVehicleType(
            value as VehicleType
          )
        }
      />

      {type ===
      'crane_truck' ? (
        <>
          <SelectField
            label="Грузоподъёмность борта"
            value={String(
              form.properties
                .side_capacity ??
                5
            )}
            options={numberOptions(
              [
                5, 8, 10, 12,
                15, 20,
              ],
              'т'
            )}
            disabled={submitting}
            onChange={(value) =>
              setProperty(
                'side_capacity',
                Number(value)
              )
            }
          />

          <SelectField
            label="Грузоподъёмность стрелы"
            value={String(
              form.properties
                .boom_capacity ??
                3
            )}
            options={numberOptions(
              [3, 5, 7, 9],
              'т'
            )}
            disabled={submitting}
            onChange={(value) =>
              setProperty(
                'boom_capacity',
                Number(value)
              )
            }
          />

          <SelectField
            label="Длина борта"
            value={String(
              form.properties
                .bed_length ?? 5
            )}
            options={numberOptions(
              [
                5, 6, 7, 8,
                9, 12, 14,
              ],
              'м'
            )}
            disabled={submitting}
            onChange={(value) =>
              setProperty(
                'bed_length',
                Number(value)
              )
            }
          />
        </>
      ) : null}

      {type ===
      'dump_truck' ? (
        <SelectField
          label="Объём кузова"
          value={String(
            form.properties
              .capacity ?? 20
          )}
          options={numberOptions(
            [20, 25, 35, 45],
            'м³'
          )}
          disabled={submitting}
          onChange={(value) =>
            setProperty(
              'capacity',
              Number(value)
            )
          }
        />
      ) : null}

      {type ===
      'backhoe_loader' ? (
        <View
          style={
            styles.booleanGroup
          }
        >
          <BooleanField
            label="Шнек"
            value={Boolean(
              form.properties
                .auger
            )}
            disabled={submitting}
            onChange={(value) =>
              setProperty(
                'auger',
                value
              )
            }
          />

          <BooleanField
            label="Гидромолот"
            value={Boolean(
              form.properties
                .hydraulic_hammer
            )}
            disabled={submitting}
            onChange={(value) =>
              setProperty(
                'hydraulic_hammer',
                value
              )
            }
          />

          <BooleanField
            label="Узкий ковш"
            value={Boolean(
              form.properties
                .narrow_bucket
            )}
            disabled={submitting}
            onChange={(value) =>
              setProperty(
                'narrow_bucket',
                value
              )
            }
          />
        </View>
      ) : null}

      {type ===
      'mini_loader' ? (
        <View
          style={
            styles.booleanGroup
          }
        >
          <BooleanField
            label="Щётка"
            value={Boolean(
              form.properties
                .brush
            )}
            disabled={submitting}
            onChange={(value) =>
              setProperty(
                'brush',
                value
              )
            }
          />
        </View>
      ) : null}

      <View style={styles.field}>
        <Text style={styles.label}>
          Модель
        </Text>

        <TextInput
          value={form.model}
          editable={!submitting}
          onChangeText={(value) => {
            setForm((current) => ({
              ...current,
              model: value,
            }));
            setValidationError('');
          }}
          placeholder="Например, КАМАЗ 65115"
          placeholderTextColor="#969696"
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>
          Госномер
        </Text>

        <TextInput
          value={
            form.license_plate
          }
          editable={!submitting}
          autoCapitalize="characters"
          maxLength={12}
          onChangeText={(value) => {
            setForm((current) => ({
              ...current,
              license_plate:
                value.slice(0, 12),
            }));
            setValidationError('');
          }}
          placeholder="А123ВС 77"
          placeholderTextColor="#969696"
          style={styles.input}
        />
      </View>

      {validationError ||
      errorMessage ? (
        <View
          style={styles.errorBox}
        >
          <Text
            style={styles.errorText}
          >
            {validationError ||
              errorMessage}
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          disabled={
            submitting ||
            loadingTypes
          }
          onPress={handleSubmit}
          style={[
            styles.submit,
            (submitting ||
              loadingTypes) &&
              styles.disabled,
          ]}
        >
          <Text
            style={
              styles.submitText
            }
          >
            {submitting
              ? submittingLabel
              : submitLabel}
          </Text>
        </Pressable>

        <Pressable
          disabled={submitting}
          onPress={onCancel}
          style={styles.cancel}
        >
          <Text
            style={
              styles.cancelText
            }
          >
            К моей технике
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    form: {
      gap: 16,
    },

    field: {
      gap: 7,
    },

    label: {
      color: '#191919',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 12,
      lineHeight: 16,
    },

    input: {
      minHeight: 48,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: '#c5c4bc',
      borderRadius: 8,
      color: '#191919',
      backgroundColor: '#ffffff',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 15,
    },

    select: {
      minHeight: 48,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      borderWidth: 1,
      borderColor: '#c5c4bc',
      borderRadius: 8,
      backgroundColor: '#ffffff',
    },

    selectText: {
      flex: 1,
      color: '#191919',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 15,
    },

    placeholder: {
      color: '#969696',
    },

    chevron: {
      marginLeft: 8,
      color: '#737373',
      fontSize: 10,
    },

    selectBackdrop: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
      backgroundColor:
        'rgba(0,0,0,0.45)',
    },

    selectModal: {
      maxHeight: '70%',
      padding: 20,
      borderRadius: 16,
      backgroundColor: '#ffffff',
    },

    selectModalTitle: {
      marginBottom: 12,
      color: '#191919',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 18,
      lineHeight: 22,
    },

    selectOptions: {
      flexGrow: 0,
    },

    selectOption: {
      minHeight: 48,
      paddingHorizontal: 12,
      justifyContent: 'center',
      borderRadius: 8,
    },

    selectOptionActive: {
      backgroundColor: '#f1f1f1',
    },

    selectOptionText: {
      color: '#191919',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 15,
    },

    selectOptionTextActive: {
      fontFamily:
        'Roboto_500Medium',
    },

    booleanGroup: {
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: '#c5c4bc',
      borderRadius: 8,
      backgroundColor: '#ffffff',
    },

    booleanField: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    booleanLabel: {
      color: '#191919',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 15,
    },

    errorBox: {
      padding: 12,
      borderWidth: 1,
      borderColor:
        'rgba(198,93,46,0.28)',
      borderRadius: 8,
      backgroundColor:
        'rgba(198,93,46,0.10)',
    },

    errorText: {
      color: '#8a2f22',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 13,
      lineHeight: 18,
    },

    actions: {
      marginTop: 2,
      gap: 8,
    },

    submit: {
      minHeight: 50,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: '#191919',
    },

    submitText: {
      color: '#ffffff',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 14,
    },

    cancel: {
      minHeight: 50,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#c5c4bc',
      borderRadius: 8,
      backgroundColor: '#ffffff',
    },

    cancelText: {
      color: '#191919',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 14,
    },

    disabled: {
      opacity: 0.55,
    },
  });