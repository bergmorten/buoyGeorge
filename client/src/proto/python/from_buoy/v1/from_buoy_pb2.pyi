from from_buoy.ad2cp.v1 import ad2cp_pb2 as _ad2cp_pb2
from from_buoy.ahrs.v1 import ahrs_pb2 as _ahrs_pb2
from from_buoy.gnss.v1 import gnss_pb2 as _gnss_pb2
from from_buoy.log.v1 import log_pb2 as _log_pb2
from from_buoy.manifest.v1 import manifest_pb2 as _manifest_pb2
from from_buoy.self_test.v1 import self_test_pb2 as _self_test_pb2
from from_buoy.system.v1 import system_pb2 as _system_pb2
from from_buoy.wave.v1 import wave_pb2 as _wave_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class MultiMessage(_message.Message):
    __slots__ = ("message_id", "total_messages", "sequence_number")
    MESSAGE_ID_FIELD_NUMBER: _ClassVar[int]
    TOTAL_MESSAGES_FIELD_NUMBER: _ClassVar[int]
    SEQUENCE_NUMBER_FIELD_NUMBER: _ClassVar[int]
    message_id: int
    total_messages: int
    sequence_number: int
    def __init__(self, message_id: _Optional[int] = ..., total_messages: _Optional[int] = ..., sequence_number: _Optional[int] = ...) -> None: ...

class SensorRecord(_message.Message):
    __slots__ = ("profiles", "ahrs", "waves", "locations")
    PROFILES_FIELD_NUMBER: _ClassVar[int]
    AHRS_FIELD_NUMBER: _ClassVar[int]
    WAVES_FIELD_NUMBER: _ClassVar[int]
    LOCATIONS_FIELD_NUMBER: _ClassVar[int]
    profiles: _containers.RepeatedCompositeFieldContainer[_ad2cp_pb2.Profile]
    ahrs: _containers.RepeatedCompositeFieldContainer[_ahrs_pb2.Recording]
    waves: _containers.RepeatedCompositeFieldContainer[_wave_pb2.Profile]
    locations: _containers.RepeatedCompositeFieldContainer[_gnss_pb2.Location]
    def __init__(self, profiles: _Optional[_Iterable[_Union[_ad2cp_pb2.Profile, _Mapping]]] = ..., ahrs: _Optional[_Iterable[_Union[_ahrs_pb2.Recording, _Mapping]]] = ..., waves: _Optional[_Iterable[_Union[_wave_pb2.Profile, _Mapping]]] = ..., locations: _Optional[_Iterable[_Union[_gnss_pb2.Location, _Mapping]]] = ...) -> None: ...

class FromBuoy(_message.Message):
    __slots__ = ("version", "seconds_2025", "multi_message", "system", "logs", "self_test", "manifest", "sensor_record")
    VERSION_FIELD_NUMBER: _ClassVar[int]
    SECONDS_2025_FIELD_NUMBER: _ClassVar[int]
    MULTI_MESSAGE_FIELD_NUMBER: _ClassVar[int]
    SYSTEM_FIELD_NUMBER: _ClassVar[int]
    LOGS_FIELD_NUMBER: _ClassVar[int]
    SELF_TEST_FIELD_NUMBER: _ClassVar[int]
    MANIFEST_FIELD_NUMBER: _ClassVar[int]
    SENSOR_RECORD_FIELD_NUMBER: _ClassVar[int]
    version: int
    seconds_2025: int
    multi_message: MultiMessage
    system: _containers.RepeatedCompositeFieldContainer[_system_pb2.Performance]
    logs: _containers.RepeatedCompositeFieldContainer[_log_pb2.Entry]
    self_test: _self_test_pb2.SelfTest
    manifest: _manifest_pb2.Manifest
    sensor_record: SensorRecord
    def __init__(self, version: _Optional[int] = ..., seconds_2025: _Optional[int] = ..., multi_message: _Optional[_Union[MultiMessage, _Mapping]] = ..., system: _Optional[_Iterable[_Union[_system_pb2.Performance, _Mapping]]] = ..., logs: _Optional[_Iterable[_Union[_log_pb2.Entry, _Mapping]]] = ..., self_test: _Optional[_Union[_self_test_pb2.SelfTest, _Mapping]] = ..., manifest: _Optional[_Union[_manifest_pb2.Manifest, _Mapping]] = ..., sensor_record: _Optional[_Union[SensorRecord, _Mapping]] = ...) -> None: ...
