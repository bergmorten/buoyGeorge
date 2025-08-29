from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class CPU(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    CPU_UNSPECIFIED: _ClassVar[CPU]

class Comms(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    COMMS_UNSPECIFIED: _ClassVar[Comms]
    COMMS_ROCKBLOCK_9704: _ClassVar[Comms]
    COMMS_ROCKBLOCK_9703: _ClassVar[Comms]
    COMMS_QUALCOMM_315: _ClassVar[Comms]
    COMMS_NRF9160: _ClassVar[Comms]

class GNSS(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    GNSS_UNSPECIFIED: _ClassVar[GNSS]
    GNSS_UBLOX_NEO_F9P: _ClassVar[GNSS]
    GNSS_UBLOX_ZED_F9P: _ClassVar[GNSS]
    GNSS_UBLOX_ZED_X209P: _ClassVar[GNSS]
CPU_UNSPECIFIED: CPU
COMMS_UNSPECIFIED: Comms
COMMS_ROCKBLOCK_9704: Comms
COMMS_ROCKBLOCK_9703: Comms
COMMS_QUALCOMM_315: Comms
COMMS_NRF9160: Comms
GNSS_UNSPECIFIED: GNSS
GNSS_UBLOX_NEO_F9P: GNSS
GNSS_UBLOX_ZED_F9P: GNSS
GNSS_UBLOX_ZED_X209P: GNSS

class Manifest(_message.Message):
    __slots__ = ("serial_number", "firmware_version", "cpu", "gnss", "comms", "manifest")
    SERIAL_NUMBER_FIELD_NUMBER: _ClassVar[int]
    FIRMWARE_VERSION_FIELD_NUMBER: _ClassVar[int]
    CPU_FIELD_NUMBER: _ClassVar[int]
    GNSS_FIELD_NUMBER: _ClassVar[int]
    COMMS_FIELD_NUMBER: _ClassVar[int]
    MANIFEST_FIELD_NUMBER: _ClassVar[int]
    serial_number: str
    firmware_version: str
    cpu: CPU
    gnss: GNSS
    comms: _containers.RepeatedScalarFieldContainer[Comms]
    manifest: str
    def __init__(self, serial_number: _Optional[str] = ..., firmware_version: _Optional[str] = ..., cpu: _Optional[_Union[CPU, str]] = ..., gnss: _Optional[_Union[GNSS, str]] = ..., comms: _Optional[_Iterable[_Union[Comms, str]]] = ..., manifest: _Optional[str] = ...) -> None: ...
