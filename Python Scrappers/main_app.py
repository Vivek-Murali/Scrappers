import abc
from typing import (Any, String, Optional, List, Dict)
from functools import wraps

class FrameWork(metaclass=abc.ABCMeta):
    def __init__(self) -> None:
        self.version = "0.2.a.12V"

    @classmethod
    def __subclasshook__(cls, subclass):
        return (hasattr(subclass, 'load_data_source') and 
                callable(subclass.load_data_source) and 
                hasattr(subclass, 'extract_text') and 
                callable(subclass.extract_text) or 
                NotImplemented)

    def __str__(self):
        s ="Version of Scrapper: %s \n"%self.version
        return s

    @abc.abstractmethod
    def load_data_source(self, path: String, file_name: String):
        """Load in the data set"""
        raise NotImplementedError

    @abc.abstractmethod
    def extract_text(self, full_file_path: String):
        """Extract text from the data set"""
        raise NotImplementedError


class ScrapperClass(FrameWork):
    def __init__(self) -> None:
        pass

    def load_data_source(self, path: String, file_name: String):
        return super().load_data_source(path, file_name)

    def extract_text(self, full_file_path: String):
        return super().extract_text(full_file_path)