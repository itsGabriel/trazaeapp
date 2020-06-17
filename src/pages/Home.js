import React, { useEffect, useState, useRef, Fragment } from 'react';

import {
    TouchableOpacity, Platform,
    View, Text,
    StyleSheet, Dimensions, SafeAreaView, Alert
} from 'react-native';

import { Button } from 'react-native-paper';
import Spinner from 'react-native-loading-spinner-overlay';

import * as Location from 'expo-location'
import MapView, { Marker } from "react-native-maps";

import MapViewDirections from 'react-native-maps-directions';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import RBSheet from "react-native-raw-bottom-sheet";
import { FontAwesome5 } from '@expo/vector-icons';
import { confirm } from '../services/freight.service';

export default function Home({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [destination, setDestination] = useState(null);
    const [freightValue, setFreightValue] = useState(null)
    const [tipoveiculo, setTipoVeiculo] = useState(null)
    const [formData, setFormData] = useState({
        origem_latitude: null,
        origem_longitude: null,
        destino_latitude: null,
        destino_longitude: null,
        tipo_veiculo: null,
        data_frete: '16/06/2020',
        distancia: null
    }
    );

    const LATITUDE_DELTA = 0.0922
    const LONGITUDE_DELTA = 0.0421

    const refRBSheet = useRef();
    const refMarker = useRef();

    useEffect(() => {
        (async () => {
            console.log('async effect')
            let { status } = await Location.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Oops', 'Permission to access location was denied');
                setLoading(false);
            } else {
                console.log('async effect')
                let location = await Location.getCurrentPositionAsync({});
                handleFormDataState('origem_latitude', location.coords.latitude)
                handleFormDataState('origem_longitude', location.coords.longitude)

                setUserLocation(location)
                setLoading(false);
            }
        })()
    }, []);

    async function submitButton() {
        // const data = await confirm(formData);

        // const { res } = data;

        // console.log(formData)

        setFreightValue(200.25)

        // if (res) {
        //     console.log(res)
        //     setFreightValue(res.valor)
        // } else {
        //     Alert.alert("Erro", data['err']['data']['error'])
        // }
    }

    function getInitialRegion() {
        return {
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
        }
    }

    function getInitialMarker() {
        return {
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
        }
    }

    function handleSelectedLocation(data, { geometry }) {
        const {
            location: { lat: latitude, lng: longitude }
        } = geometry;

        setFormData({ ...formData, destino_latitude: latitude, destino_longitude: longitude });

        setDestination({
            latitude,
            longitude,
            title: data.structured_formatting.secondary_text
        })

        refRBSheet.current.open()
    }

    function handleFormDataState(key, value) {
        return setFormData(previusValue => ({ ...previusValue, [key]: value }))
    }

    return (
        <SafeAreaView style={styles.container}>
            <Spinner
                visible={loading}
                textContent={'Carregando...'}
            />
            {
                userLocation &&
                <MapView
                    style={styles.mapStyle}
                    initialRegion={getInitialRegion()}
                >
                    <MapView.Marker.Animated
                        ref={refMarker}
                        coordinate={getInitialMarker()}
                    />

                    {
                        destination &&
                        <Fragment>
                            <MapViewDirections
                                origin={userLocation.coords}
                                strokeColor="#8099f2"
                                strokeWidth={4}
                                destination={destination}
                                onReady={result => {
                                    setFormData({ ...formData, distancia: result.distance })
                                }}
                                apikey="API_KEY"
                            />
                            <MapView.Marker
                                ref={refMarker}
                                pinColor="indigo"
                                coordinate={destination}
                            />
                        </Fragment>
                    }

                </MapView>
            }

            {userLocation &&
                <GooglePlacesAutocomplete
                    placeholder="Para onde?"
                    placeholderTextColor="#333"
                    fetchDetails
                    onPress={handleSelectedLocation}
                    keyboardShouldPersistTaps="handled"
                    onFail={error => console.log(error)}
                    query={{
                        key: "API_KEY",
                        language: "pt-BR",
                        location: `${userLocation.coords.latitude},${userLocation.coords.longitude}`,
                        radius: 2000
                    }}
                    enablePoweredByContainer={false}
                    styles={{
                        container: {
                            position: "absolute",
                            top: Platform.select({ ios: 60, android: 40 }),
                            width: "100%"
                        },
                        textInputContainer: {
                            flex: 1,
                            backgroundColor: "transparent",
                            height: 54,
                            marginHorizontal: 20,
                            borderTopWidth: 0,
                            borderBottomWidth: 0
                        },
                        textInput: {
                            height: 54,
                            margin: 0,
                            paddingTop: 0,
                            paddingBottom: 0,
                            paddingLeft: 20,
                            paddingRight: 20,
                            marginTop: 0,
                            marginLeft: 0,
                            marginRight: 0,
                            borderRadius: 30,
                            elevation: 5,
                            shadowColor: "#000",
                            shadowOpacity: 0.1,
                            shadowOffset: { x: 0, y: 0 },
                            shadowRadius: 15,
                            borderWidth: 1,
                            borderColor: "#DDD",
                            fontSize: 18
                        },
                        listView: {
                            borderWidth: 1,
                            borderColor: "#DDD",
                            backgroundColor: "#FFF",
                            elevation: 5,
                            shadowColor: "#000",
                            shadowOpacity: 0.1,
                            shadowOffset: { x: 0, y: 0 },
                            shadowRadius: 15,
                            marginTop: 10
                        },
                        description: {
                            fontSize: 16
                        },
                        row: {
                            padding: 20,
                            height: 58
                        }
                    }}
                />
            }

            {
                destination &&
                <RBSheet
                    ref={refRBSheet}
                    openDuration={500}
                    closeOnDragDown
                    customStyles={{
                        container: {
                            ...styles.bottomView
                        }
                    }}
                >
                    <Text style={styles.textVehicle}>Qual veiculo melhor lhe atende?</Text>

                    <View style={styles.imageBottomView}>
                        <TouchableOpacity style={styles.roundedVehicle} onPress={() => {
                            handleFormDataState('tipo_veiculo', 3)
                        }
                        }>
                            <FontAwesome5 name="truck-moving" size={30} color="black" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.roundedVehicle} onPress={() => {
                            handleFormDataState('tipo_veiculo', 2)
                        }
                        }>
                            <FontAwesome5 name="truck-pickup" size={33} color="black" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.roundedVehicle} onPress={() => {
                            handleFormDataState('tipo_veiculo', 1)
                        }
                        }>
                            <FontAwesome5 name="motorcycle" size={33} color="black" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.destinationBottomViewName}>
                        <Text style={{ fontSize: 12, color: 'grey' }}>
                            {destination.title}
                        </Text>

                        {
                            freightValue && 
                            <Text style={{ fontSize: 25, color: 'grey' }}>
                                R${freightValue}
                            </Text>
                        }
                    </View>

                    <View style={styles.borderButtons}>
                        {
                            !freightValue &&
                            <Button mode="contained" style={{ marginHorizontal: 5, width: 320 }} onPress={() => submitButton()} color="#303030">Buscar</Button>
                        }

                        {freightValue &&
                            <Fragment>
                                <Button mode="contained" style={{ marginHorizontal: 5 }} onPress={() => console.log('confimado')} color="#303030">Confirmar</Button>
                                <Button mode="contained" style={{ marginHorizontal: 5 }} onPress={() => console.log('schedule')} color="#bf6262">Agendar</Button>
                            </Fragment>
                        }
                    </View>
                </RBSheet>
            }
        </SafeAreaView>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    bottomView: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        alignItems: 'center',
    },

    imageBottomView: {
        flexDirection: "row",
        marginVertical: 10,
    },

    destinationBottomViewName: {
        alignItems: 'center',
        marginHorizontal: 20,
    },

    borderButtons: {
        flexDirection: 'row',
        marginVertical: 25,
        marginHorizontal: 35,
        justifyContent: 'space-between'
    },

    cardView: {
        marginVertical: 20,
        marginHorizontal: 18
    },

    form: {
        marginTop: 5,
        paddingHorizontal: 20
    },

    mapStyle: {
        flex: 1,
    },


    formView: {
        justifyContent: 'center',
        height: 55,
        borderBottomWidth: 0.18,
        borderBottomColor: '#727272'
    },

    input: {
        marginVertical: 10,
        marginHorizontal: 30,
        color: '#000',
    },

    buttonView: {
        flex: 1,
        backgroundColor: 'transparent',
    },

    textVehicle: {
        fontSize: 17,
        marginBottom: 5
    },

    roundedVehicle: {
        alignItems: 'center',
        backgroundColor: '#d7d4d4',
        borderRadius: 50,
        width: 55,
        height: 55,
        marginHorizontal: 6,
        justifyContent: 'center',
    },

    submitButton: {
        backgroundColor: '#4c4b4b',
        height: 55,

    },

    submitButtonStyle: {
        marginTop: 10,
        elevation: 3,
    },
});