""" Common utilities. """
import importlib
import inspect
import os


def import_subclass(import_path: str, subcls: type) -> dict:
    """Import core modules based on path and subclass.
    Args:
        import_path (str): relative path of where the modules a
        subcls (object): The parent class to load.
    Returns:
        dict: Dictionary of class paths.
    """
    modules = {}

    for target in os.listdir(f"{import_path}"):
        if target == "__init__.py" or target[-3:] != ".py":
            continue
        else:
            target_module = ".".join(f"{import_path}/{target[:-3]}".split("/"))
            targetcls = importlib.import_module(target_module)
            for _, item in inspect.getmembers(targetcls):
                if inspect.isclass(item):  # is the item actually a class definition?
                    if issubclass(item, subcls) and item is not subcls:
                        modules[target[:-3]] = item
    return modules
