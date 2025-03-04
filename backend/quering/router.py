class QueryDBRouter:
    """
    A router to control all database operations on models in the quering application.
    """
    def db_for_read(self, model, **hints):
        """
        Attempts to read quering models go to querydb.
        """
        if model._meta.app_label == 'quering':
            return 'querydb'
        return None

    def db_for_write(self, model, **hints):
        """
        Attempts to write quering models go to querydb.
        """
        if model._meta.app_label == 'quering':
            return 'querydb'
        return None

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if a model in the quering app is involved.
        """
        if obj1._meta.app_label == 'quering' or \
           obj2._meta.app_label == 'quering':
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Make sure the quering app only appears in the 'querydb' database.
        """
        if app_label == 'quering':
            return db == 'querydb'
        return None
